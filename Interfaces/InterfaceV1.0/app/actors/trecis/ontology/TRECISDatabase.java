package actors.trecis.ontology;

import java.io.BufferedWriter;
import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.mapdb.DB;
import org.mapdb.DBMaker;
import org.mapdb.HTreeMap;
import org.mapdb.Serializer;

import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectWriter;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import play.libs.Json;
import play.mvc.WebSocket;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;

/**
 * This is the accessor class for the underlying database used for
 * TRECIS annotation
 * 
 * Its backed by MapDB.
 * 
 * 
 * @author richardm
 *
 */
public class TRECISDatabase {

	// database
	DB db;
	
	// Top level data table, contains users and the events they have worked on.
	HTreeMap<String, String> userTable;
	
	// Tables that contain the annotations by the users, loads on-demand
	Map<String,Map<String,HTreeMap<String, String>>> annotationTables;
	
	// Tweet tables that contain the queues of tweets to be assessed, loads on-demand
	Map<String,HTreeMap<String, String>> tweetTables;
	
	/* A Jackson Object writer. It allows us to turn Java objects
	 * into JSON strings easily. */
	ObjectWriter oWriter = new ObjectMapper().writerWithDefaultPrettyPrinter();
	ObjectMapper oReader = new ObjectMapper();
	
	/*
	 * A Json parser, used to extract information within tweets
	 */
	JsonParser parser = new JsonParser();
	
	public TRECISDatabase(String dbFile) {
		db = DBMaker
				.fileDB(dbFile)
				.closeOnJvmShutdown()
				.make();
		
		userTable = db.hashMap("UserTable")
				.keySerializer(Serializer.STRING)
				.valueSerializer(Serializer.STRING)
				.createOrOpen();
		
		annotationTables = new HashMap<String,Map<String,HTreeMap<String, String>>>();
		tweetTables = new HashMap<String,HTreeMap<String, String>>();
		
		
	}
	
	
	public TRECISAnnotator getOrCreateUser(String annotatorID) {
		if (!annotationTables.containsKey(annotatorID)) annotationTables.put(annotatorID, new HashMap<String,HTreeMap<String, String>>());
		if (userTable.containsKey(annotatorID)) {
			// load
			try {
				return oReader.readValue(userTable.get(annotatorID), TRECISAnnotator.class);
			} catch (Exception e) {
				e.printStackTrace();
				return null;
			}
			
		} else {
			TRECISAnnotator annotator = new TRECISAnnotator();
			annotator.setID(annotatorID);
			annotator.setEventsAnnotated(new ArrayList<TRECISEvent>());
			try {
				userTable.put(annotatorID, oWriter.writeValueAsString(annotator));
			} catch (JsonProcessingException e) {
				e.printStackTrace();
			}
			return annotator;
		}
	}
	
	public void prepareUserForWork(String annotatorID) {
		TRECISAnnotator annotator = getOrCreateUser(annotatorID);
		
		annotationTables.get(annotatorID).clear();
		
		if (!annotationTables.containsKey(annotatorID)) annotationTables.put(annotatorID, new HashMap<String,HTreeMap<String, String>>());
		Map<String,HTreeMap<String, String>> annotatedEvents = annotationTables.get(annotatorID);
		
		for (TRECISEvent event : annotator.getEventsAnnotated()) {
			if (!annotatedEvents.containsKey(event.annotationTableName)) {
				// we need to load the table from the database
				HTreeMap<String, String> userAnnotations = db.hashMap(event.annotationTableName)
							.keySerializer(Serializer.STRING)
							.valueSerializer(Serializer.STRING)
							.createOrOpen();
				annotatedEvents.put(event.annotationTableName, userAnnotations);
				System.err.println("Initalizing: "+annotatorID+", cached "+event.annotationTableName);
			}
		}
	}
	
	public void registerEventWithUser(String annotatorID, TRECISEvent event) {
		TRECISAnnotator annotator = getOrCreateUser(annotatorID);
		boolean found = false;
		for (TRECISEvent e : annotator.getEventsAnnotated()) {
			if (e.getIdentifier().equalsIgnoreCase(event.getIdentifier())) {
				found=true;
			}
		}
		if (!found) {
			annotator.getEventsAnnotated().add(event);
			try {
				userTable.put(annotatorID, oWriter.writeValueAsString(annotator));
			} catch (JsonProcessingException e1) {
				e1.printStackTrace();
			}
		}
		
		if (!annotationTables.get(annotatorID).containsKey(event.annotationTableName)) {
			
			HTreeMap<String, String> annotationTable = db.hashMap(event.annotationTableName)
					.keySerializer(Serializer.STRING)
					.valueSerializer(Serializer.STRING)
					.createOrOpen();
			
			annotationTables.get(annotatorID).put(event.annotationTableName, annotationTable);
			System.err.println("Initalizing: "+annotatorID+", cached "+event.annotationTableName);
		}
		
		prepareUserForWork(annotatorID);
	}
	
	public void saveAnnotation(TRECISAnnotation annotation, String annotationTableName, String annotatorID) {
		try {
			annotationTables.get(annotatorID).get(annotationTableName).put(annotation.postID, oWriter.writeValueAsString(annotation));
		} catch (JsonProcessingException e) {
			e.printStackTrace();
		}
		
	}
	
	public boolean isEventRegisteredToUser(String eventIdentifier, String annotatorID) {
		
		// check the user table first
		if (!userTable.containsKey(annotatorID)) return false;
		TRECISAnnotator annotator = getOrCreateUser(annotatorID);
		boolean eventFound = false;
		for (TRECISEvent event : annotator.getEventsAnnotated()) {
			if (event.identifier.equalsIgnoreCase(eventIdentifier)) eventFound = true;
		}
		
		if (!eventFound) return false; 
		
		return true;
		
	}
	
	public boolean haveTweetsBeenImportedForEvent(String eventIdentifier, String annotatorID) {
		
		String tableName = annotatorID+"-"+eventIdentifier+"-Queue";
		if (tweetTables.containsKey(tableName)) return true;
		
		if (db.exists(tableName)) {
			HTreeMap<String, String> tweetTable = db.hashMap(tableName)
			.keySerializer(Serializer.STRING)
			.valueSerializer(Serializer.STRING)
			.createOrOpen();
			
			tweetTables.put(tableName, tweetTable);
			return true;
		}
		
		return false;
	
		
		
	}
	
	public void addTweetToAnnotationQueue(String tweetID, String tweetJSON, String annotatorID, String eventIdentifier) {
		String tableName = annotatorID+"-"+eventIdentifier+"-Queue";
		
		HTreeMap<String, String> tweetTable = null;
		
		if (tweetTables.containsKey(tableName)) tweetTable = tweetTables.get(tableName);
		else tweetTable = db.hashMap(tableName)
				.keySerializer(Serializer.STRING)
				.valueSerializer(Serializer.STRING)
				.createOrOpen();
	
		tweetTables.put(tableName, tweetTable);
		
		tweetTable.put(tweetID, tweetJSON);
		
	}
	
	public String getNextTweetForUserInEvent(String annotatorID, String eventIdentifier) {
		String tableName = annotatorID+"-"+eventIdentifier+"-Queue";
		
		HTreeMap<String, String> tweetTable = tweetTables.get(tableName);
		if (tweetTable.size()==0) return null;
		else {
			String randomTweetID = (String)tweetTable.keySet().iterator().next();
			String tweetJSON = tweetTable.get(randomTweetID);
			return tweetJSON;
		}
	}
	
	public boolean markTweetAsIrrelevant(String annotatorID, String eventIdentifier, String tweetID) {
		
		// Stage 1: remove it from the queue to be annotated
		String queueTableName = annotatorID+"-"+eventIdentifier+"-Queue";
		HTreeMap<String, String> queueTable = tweetTables.get(queueTableName);
		if (!queueTable.containsKey(tweetID)) return false;
		
		String tweetJSON = queueTable.remove(tweetID);
		JsonObject tweet = parser.parse(tweetJSON).getAsJsonObject();
		
		// Stage 2: record tweet as irrelevant with user
		String annotationTableName = annotatorID+"-"+eventIdentifier;
		
		TRECISAnnotation annotation = new TRECISAnnotation();
		annotation.setPostID(tweetID);
		annotation.setText(tweet.get("text").getAsString());
		
		List<String> categories = new ArrayList<String>();
		categories.add("Irrelevant");
		annotation.setCategories(categories);
		
		List<String> indicatorterms  = new ArrayList<String>();
		annotation.setIndicatorTerms(indicatorterms);
		
		annotation.setTimestamp(new Date(System.currentTimeMillis()).toGMTString());
		
		annotation.setPriority("Lowest");
		
		saveAnnotation(annotation,annotationTableName,annotatorID);
		
		return true;
	}
	
	public boolean markTweetRelevantAndSetCategories(String annotatorID, String eventIdentifier, String tweetID, List<String> categories) {
		
		// Stage 1: remove it from the queue to be annotated
		String queueTableName = annotatorID+"-"+eventIdentifier+"-Queue";
		HTreeMap<String, String> queueTable = tweetTables.get(queueTableName);
		if (!queueTable.containsKey(tweetID)) return false;
		
		String tweetJSON = queueTable.remove(tweetID);
		JsonObject tweet = parser.parse(tweetJSON).getAsJsonObject();
		
		// Stage 2: record tweet as irrelevant with user
		String annotationTableName = annotatorID+"-"+eventIdentifier;
				
		TRECISAnnotation annotation = new TRECISAnnotation();
		annotation.setPostID(tweetID);
		annotation.setText(tweet.get("text").getAsString());
				
		annotation.setCategories(categories);
				
		List<String> indicatorterms  = new ArrayList<String>();
		annotation.setIndicatorTerms(indicatorterms);
				
		annotation.setTimestamp(new Date(System.currentTimeMillis()).toGMTString());
				
		annotation.setPriority("Unknown");
				
		saveAnnotation(annotation,annotationTableName,annotatorID);
				
		return true;
		
	}
	
    public boolean setPriorityForTweet(String annotatorID, String eventIdentifier, String tweetID, String priority) {
		
    	String annotationTableName = annotatorID+"-"+eventIdentifier;
		if (!annotationTables.containsKey(annotatorID)) return false;
		if (!annotationTables.get(annotatorID).containsKey(annotationTableName)) return false;
		if (!annotationTables.get(annotatorID).get(annotationTableName).containsKey(tweetID)) return false;
		
		String annotationJSON = annotationTables.get(annotatorID).get(annotationTableName).get(tweetID);
		try {
			TRECISAnnotation annotation = (TRECISAnnotation)oReader.readValue(annotationJSON, TRECISAnnotation.class);
			annotation.setPriority(priority);
			saveAnnotation(annotation,annotationTableName,annotatorID);
		} catch (Exception e) {
			e.printStackTrace();
			return false;
		}
				
		return true;
		
	}
	
	public boolean markTweetWithAllDetails(String annotatorID, String eventIdentifier, String tweetID, List<String> categories, List<String> indicatorTerms, String priority) {
		
		// Stage 1: remove it from the queue to be annotated
		String queueTableName = annotatorID+"-"+eventIdentifier+"-Queue";
		HTreeMap<String, String> queueTable = tweetTables.get(queueTableName);
		if (!queueTable.containsKey(tweetID)) return false;
		
		String tweetJSON = queueTable.remove(tweetID);
		JsonObject tweet = parser.parse(tweetJSON).getAsJsonObject();
		
		// Stage 2: record tweet as irrelevant with user
		String annotationTableName = annotatorID+"-"+eventIdentifier;
				
		TRECISAnnotation annotation = new TRECISAnnotation();
		annotation.setPostID(tweetID);
		annotation.setText(tweet.get("text").getAsString());
		annotation.setCategories(categories);
		annotation.setIndicatorTerms(indicatorTerms);
		annotation.setTimestamp(new Date(System.currentTimeMillis()).toGMTString());
		annotation.setPriority(priority);
				
		saveAnnotation(annotation,annotationTableName,annotatorID);
				
		return true;
		
	}
	
	public List<String> getLabelledTweetAsTerms(String annotatorID, String eventIdentifier, String tweetID) {
		String annotationTableName = annotatorID+"-"+eventIdentifier;
		if (!annotationTables.containsKey(annotatorID)) return null;
		if (!annotationTables.get(annotatorID).containsKey(annotationTableName)) return null;
		if (!annotationTables.get(annotatorID).get(annotationTableName).containsKey(tweetID)) return null;
		
		String annotationJSON = annotationTables.get(annotatorID).get(annotationTableName).get(tweetID);
		try {
			TRECISAnnotation annotation = (TRECISAnnotation)oReader.readValue(annotationJSON, TRECISAnnotation.class);
			List<String> terms = new ArrayList<String>();
			for (String term : annotation.getText().split(" ")) {
				terms.add(term);
			}
			return terms;
		} catch (Exception e) {
			e.printStackTrace();
			return null;
		}
	}
	
	public List<String> getIndicatorTermsForTweet(String annotatorID, String eventIdentifier, String tweetID) {
		String annotationTableName = annotatorID+"-"+eventIdentifier;
		if (!annotationTables.containsKey(annotatorID)) return null;
		if (!annotationTables.get(annotatorID).containsKey(annotationTableName)) return null;
		if (!annotationTables.get(annotatorID).get(annotationTableName).containsKey(tweetID)) return null;
		
		String annotationJSON = annotationTables.get(annotatorID).get(annotationTableName).get(tweetID);
		try {
			TRECISAnnotation annotation = (TRECISAnnotation)oReader.readValue(annotationJSON, TRECISAnnotation.class);
			return annotation.getIndicatorTerms();
		} catch (Exception e) {
			e.printStackTrace();
			return null;
		}
	}
	
	public void deleteUser(String annotatorID) {
		
		if (userTable.containsKey(annotatorID)) {
			try {
				TRECISAnnotator annotator = (TRECISAnnotator)oReader.readValue(userTable.remove(annotatorID), TRECISAnnotator.class);
				
				
				for (TRECISEvent event : annotator.getEventsAnnotated()) {
					
					// clear the tweet queue
					HTreeMap<String,String> tweetTable = null;
					String queueTableName = event.getAnnotationTableName()+"-Queue";
					if (tweetTables.containsKey(queueTableName)) tweetTable = tweetTables.remove(queueTableName);
					else tweetTable = db.hashMap(queueTableName)
					.keySerializer(Serializer.STRING)
					.valueSerializer(Serializer.STRING)
					.createOrOpen();
					if (tweetTable!=null) {
						tweetTable.clear();
					}
					
					// clear the annotations
					HTreeMap<String,String> annotationTable = null;
					if (annotationTables.containsKey(annotatorID)) {
						if (annotationTables.get(annotatorID).containsKey(event.getAnnotationTableName())) {
							annotationTable = annotationTables.get(annotatorID).remove(event.getAnnotationTableName());
						} else annotationTable = db.hashMap(event.getAnnotationTableName())
								.keySerializer(Serializer.STRING)
								.valueSerializer(Serializer.STRING)
								.createOrOpen();
					}
					
					if (annotationTable!=null) {
						annotationTable.clear();
					}
				}
				
			} catch (Exception e) {
				e.printStackTrace();
			}
			
		}
	}
	
	public boolean updateIndicatorTermsForTweet(String annotatorID, String eventIdentifier, String tweetID, List<String> indicatorTerms) {

		String annotationTableName = annotatorID+"-"+eventIdentifier;
		if (!annotationTables.containsKey(annotatorID)) return false;
		if (!annotationTables.get(annotatorID).containsKey(annotationTableName)) return false;
		if (!annotationTables.get(annotatorID).get(annotationTableName).containsKey(tweetID)) return false;
		
		String annotationJSON = annotationTables.get(annotatorID).get(annotationTableName).get(tweetID);
		try {
			TRECISAnnotation annotation = (TRECISAnnotation)oReader.readValue(annotationJSON, TRECISAnnotation.class);
			annotation.setIndicatorTerms(indicatorTerms);
			annotationTables.get(annotatorID).get(annotationTableName).put(tweetID, oWriter.writeValueAsString(annotation));
			return true;
		} catch (Exception e) {
			e.printStackTrace();
			return false;
		}
		
		
	}
	
	/**
	 * Look up related tweets that have not yet been assessed (i.e. are still in the queue). We actually
	 * do a linear scan of all tweets, which may be a bit slow.
	 * (an improvement here would be to use a Terrier index)
	 * @return
	 */
	public void findRelatedTweets(String annotatorID, String eventIdentifier, String tweetID, List<String> indicatorTerms, WebSocket.Out<JsonNode> out) {
		
		String annotationTableName = annotatorID+"-"+eventIdentifier+"-Queue";
		
		int possibleMatchesFound = 0;
		
		if (tweetTables.containsKey(annotationTableName) && indicatorTerms.size()>0) {
			Set<String> indicatorSet = new HashSet<String>();
			for (String t : indicatorTerms) indicatorSet.add(t.toLowerCase());
			
			HTreeMap<String, String> tweetQueue = tweetTables.get(annotationTableName);
			
			int processed = 0;
			int sinceLastReport = 0;
			
			Iterator<String> tweetIDIterator = tweetQueue.getKeys().iterator();
			while (tweetIDIterator.hasNext()) {
				String currentTweetID = tweetIDIterator.next();
				String jsonTweet = tweetQueue.get(currentTweetID);
				
				JsonObject tweet = parser.parse(jsonTweet).getAsJsonObject();
				String text = tweet.get("text").getAsString().toLowerCase();
				
				String[] terms = text.split(" ");
				boolean tweetMatched = false;
				for (String t : terms) {
					if (indicatorSet.contains(t)) {
						tweetMatched = true;
					}
				}
				
				if (tweetMatched) {
					StringBuilder textWithHighlights = new StringBuilder();
					for (String t : terms) {
						if (indicatorSet.contains(t)) {
							textWithHighlights.append("<b>");
							textWithHighlights.append(t);
							textWithHighlights.append("</b>");
						} else {
							textWithHighlights.append(t);
						}
						textWithHighlights.append(" ");
					}
					
					possibleMatchesFound++;
					ObjectNode msg = Json.newObject();
					msg.put("messagetype", "matchingTweetFound");
					msg.put("tweetID", currentTweetID);
					msg.put("text", textWithHighlights.toString());
					out.write(msg);
				}
				
				processed++;
				sinceLastReport++;
				
				if (sinceLastReport>=100) {
					sinceLastReport=0;
					{ObjectNode msg = Json.newObject();
					msg.put("messagetype", "statusMessage");
					msg.put("text", "Searching database for related tweets for this event... ("+processed+")");
					out.write(msg);}
				}
				
				
				
			}
		}
		
		
		
		
		ObjectNode msg = Json.newObject();
		msg.put("messagetype", "matchingTweetSearchDone");
		msg.put("matches", String.valueOf(possibleMatchesFound));
		out.write(msg);
		
	}
	
	
	public void writeUserAndAnnotationsToDisk(String annotatorID) {
		
		prepareUserForWork(annotatorID);
		
		try {
			BufferedWriter br = new BufferedWriter(new FileWriter(annotatorID));
			
			TRECISAnnotator annotator = getOrCreateUser(annotatorID);
			String an = oWriter.writeValueAsString(annotator);
			br.write(an);
			br.write("\n");
			
			br.write("{\"events\": [");
			boolean first = true;
			for (TRECISEvent event : annotator.getEventsAnnotated()) {
				String annotationTableName = event.getAnnotationTableName();
				if (!annotationTables.containsKey(annotatorID)) continue;
				if (!annotationTables.get(annotatorID).containsKey(annotationTableName)) continue;
				
				if (!first) br.write(",");
				br.write("\n");
				
				br.write("{\"eventid\": \""+event.identifier+"\",");
				br.write("\n");
				br.write("{\"tweets\": [");
				HTreeMap<String, String> annotations = annotationTables.get(annotatorID).get(annotationTableName);
				Iterator<String> tweetIDIterator = annotations.getKeys().iterator();
				boolean firstAnnotation = true;
				while (tweetIDIterator.hasNext()) {
					String currentTweetID = tweetIDIterator.next();
					String jsonAnnotation = annotations.get(currentTweetID);
				
					if (!firstAnnotation) br.write(",");
					br.write("\n");
					
					br.write(jsonAnnotation);
					
					firstAnnotation = false;
				}
				br.write("\n");
				br.write("]");
				br.write("}");
				first = false;
			}
			br.write("\n");
			br.write("]");
			br.write("}");
			br.close();
		} catch (Exception e) {
			e.printStackTrace();
		}
		
	}
	
}
