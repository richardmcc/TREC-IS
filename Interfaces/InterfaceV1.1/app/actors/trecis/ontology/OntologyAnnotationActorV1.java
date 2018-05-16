package actors.trecis.ontology;

import play.libs.Json;
import play.mvc.WebSocket;
import akka.actor.UntypedActor;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectWriter;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.google.gson.JsonObject;

import java.util.Iterator;
import java.util.List;
import java.util.ArrayList;
import java.util.Map;
import java.util.HashMap;
import java.io.BufferedReader;
import java.io.FileReader;
import java.io.File;
import java.lang.StringBuilder;

import dataimport.ImportV0Labelling;

public class OntologyAnnotationActorV1 extends UntypedActor {

	private final WebSocket.Out<JsonNode> out;
	
	ObjectWriter oWriter = new ObjectMapper().writerWithDefaultPrettyPrinter();
	StreamSimulatorConnector streamSimulatorConnector;
	
	Map<String,String> ontologies = new HashMap<String,String>();
	
	public OntologyAnnotationActorV1(String dbFile, String streamSimulatorHost, String ontologyDIR, WebSocket.Out<JsonNode> out) {
		this.out = out;
		
		if (StaticDatabase.db==null) StaticDatabase.db = new TRECISDatabase(dbFile);
		
		streamSimulatorConnector = new StreamSimulatorConnector(streamSimulatorHost);
		
		loadOntologies(ontologyDIR);
	}
	
	public void loadOntologies(String ontologyDIR) {
		String[] files = new File(ontologyDIR).list();
		
		try {
		for (String s : files) {
			String type = s.replace(".", "#").split("#")[2];
			
			StringBuilder json = new StringBuilder();
			
			BufferedReader br = new BufferedReader(new FileReader(ontologyDIR+"/"+s));
			String line;
			while ((line = br.readLine())!=null) {
				json.append(line);
				json.append(" ");
			}
			
			br.close();
			
			ontologies.put(type, json.toString().trim());
		}
		
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
	
	@Override
	public void onReceive(Object message) throws Exception {
	
		if (message instanceof JsonNode) {
			String requestType = ((JsonNode)message).get("messagetype").asText();
			
			System.err.println(requestType);
			
			// loginUser() (login screen)
			if (requestType.equalsIgnoreCase("loginUser")) {
				String annotatorID = ((JsonNode)message).get("annotatorID").asText();
				StaticDatabase.db.getOrCreateUser(annotatorID);
				
				ObjectNode msg = Json.newObject();
				msg.put("messagetype", "userLoggedIn");
				msg.put("annotatorID", annotatorID);
				out.write(msg);
			}
			
			// getUser() (Events Screen)
			if (requestType.equalsIgnoreCase("getUser")) {
				String annotatorID = ((JsonNode)message).get("annotatorID").asText();
				TRECISAnnotator userData = StaticDatabase.db.getOrCreateUser(annotatorID);
				
				ObjectNode msg = Json.newObject();
				msg.put("messagetype", "userData");
				msg.put("userData", oWriter.writeValueAsString(userData));
				out.write(msg);
			}
			
			// getAllEvents() (Events Screen)
			if (requestType.equalsIgnoreCase("getAllEvents")) {
				List<TRECISEvent> events = streamSimulatorConnector.getFullEventList();
				ObjectNode msg = Json.newObject();
				msg.put("messagetype", "eventList");
				msg.put("eventList", oWriter.writeValueAsString(events));
				out.write(msg);
			}
			
			// checkUserAndEventStatus() (Annotation Screen)
			if (requestType.equalsIgnoreCase("checkUserAndEventStatus")) {
				String annotatorID = ((JsonNode)message).get("annotatorID").asText();
				String eventIdentifier = ((JsonNode)message).get("eventIdentifier").asText();
				
				StaticDatabase.db.prepareUserForWork(annotatorID);
				
				boolean alreadyRegistered = StaticDatabase.db.isEventRegisteredToUser(eventIdentifier, annotatorID);
				
				if (!alreadyRegistered) {
					{ObjectNode msg = Json.newObject();
					msg.put("messagetype", "statusMessage");
					msg.put("text", "Event "+eventIdentifier+" is not registered with your annotation profile, registering...");
					out.write(msg);}
					
					boolean eventRegisteredOK = registerEventWithUser(annotatorID, eventIdentifier);
					
					if (!eventRegisteredOK) {
						{ObjectNode msg = Json.newObject();
						msg.put("messagetype", "statusMessage");
						msg.put("text", "Event "+eventIdentifier+" registration failed. Please contact the system admin.");
						out.write(msg);}
						return;
					}
					
					{ObjectNode msg = Json.newObject();
					msg.put("messagetype", "statusMessage");
					msg.put("text", "Event "+eventIdentifier+" registration complete.");
					out.write(msg);}

				} else {
					{ObjectNode msg = Json.newObject();
					msg.put("messagetype", "statusMessage");
					msg.put("text", "Event "+eventIdentifier+" was previously registered, setup is OK.");
					out.write(msg);}
					
				}
				
				//Thread.sleep(1000);
				
				boolean tweetsImported = StaticDatabase.db.haveTweetsBeenImportedForEvent(eventIdentifier, annotatorID);
				
				if (!tweetsImported) {
					
					{ObjectNode msg = Json.newObject();
					msg.put("messagetype", "statusMessage");
					msg.put("text", "Tweets for "+eventIdentifier+" have not yet been imported, attempting to download from GLA servers...");
					out.write(msg);}
					
					int importOKCount = streamSimulatorConnector.addTweetsForEventToUserQueue(annotatorID, eventIdentifier, out);
					
					if (importOKCount>=0) {
						{ObjectNode msg = Json.newObject();
						msg.put("messagetype", "statusMessage");
						msg.put("text", "Event "+eventIdentifier+" import completed successfully, "+importOKCount+" tweets have been added to your queue");
						out.write(msg);}

					} else {
						{ObjectNode msg = Json.newObject();
						msg.put("messagetype", "statusMessage");
						msg.put("text", "Event "+eventIdentifier+" import failed. Please contact the system admin.");
						out.write(msg);}
						return;
					}
				}
				
				//Thread.sleep(1000);
				
				{ObjectNode msg = Json.newObject();
				msg.put("messagetype", "userReady");
				out.write(msg);}
			}
			
			if (requestType.equalsIgnoreCase("getNextTweetForUser")) {
				
				getNextTweetForUser(message);
				
			}
			
			// importDefaultData()
			if (requestType.equalsIgnoreCase("importDefaultData")) {
				ImportV0Labelling.main(null);
			}
			
			if (requestType.equalsIgnoreCase("deleteUser")) {
				String annotatorID = ((JsonNode)message).get("annotatorID").asText();
				StaticDatabase.db.deleteUser(annotatorID);
			}
			
			// irrelevantTweet()
			if (requestType.equalsIgnoreCase("irrelevantTweet")) {
				String annotatorID = ((JsonNode)message).get("annotatorID").asText();
				String eventIdentifier = ((JsonNode)message).get("eventIdentifier").asText();
				String tweetID = ((JsonNode)message).get("tweetID").asText();
				
				StaticDatabase.db.markTweetAsIrrelevant(annotatorID, eventIdentifier, tweetID);
				
				{ObjectNode msg = Json.newObject();
				msg.put("messagetype", "selectIndicatorTerms");
				out.write(msg);}
			}
			
			// saveCategories()
			if (requestType.equalsIgnoreCase("saveCategories")) {
				String annotatorID = ((JsonNode)message).get("annotatorID").asText();
				String eventIdentifier = ((JsonNode)message).get("eventIdentifier").asText();
				String tweetID = ((JsonNode)message).get("tweetID").asText();
				Iterator<JsonNode> categoryIterator = ((JsonNode)message).get("categories").iterator();
				List<String> categories = new ArrayList<String>();
				while (categoryIterator.hasNext()) {
					String cat = categoryIterator.next().asText();
					categories.add(cat);
				}
				
				StaticDatabase.db.markTweetRelevantAndSetCategories(annotatorID, eventIdentifier, tweetID, categories);
							
				{ObjectNode msg = Json.newObject();
				msg.put("messagetype", "selectIndicatorTerms");
				out.write(msg);}
			}
			
			// requestIndicatorTerms()
			if (requestType.equalsIgnoreCase("requestIndicatorTerms")) {
				String annotatorID = ((JsonNode)message).get("annotatorID").asText();
				String eventIdentifier = ((JsonNode)message).get("eventIdentifier").asText();
				String tweetID = ((JsonNode)message).get("tweetID").asText();
				
				List<String> tweetAsTerms = StaticDatabase.db.getLabelledTweetAsTerms(annotatorID, eventIdentifier, tweetID);
				List<String> indicatorTerms = StaticDatabase.db.getIndicatorTermsForTweet(annotatorID, eventIdentifier, tweetID);
				
				{ObjectNode msg = Json.newObject();
				msg.put("messagetype", "indicatorTerms");
				msg.put("tweetAsTerms", oWriter.writeValueAsString(tweetAsTerms));
				msg.put("indicatorTerms", oWriter.writeValueAsString(indicatorTerms));
				out.write(msg);}
			}
			
			// saveIndicatorTerms()
			if (requestType.equalsIgnoreCase("saveIndicatorTerms")) {
				String annotatorID = ((JsonNode)message).get("annotatorID").asText();
				String eventIdentifier = ((JsonNode)message).get("eventIdentifier").asText();
				String tweetID = ((JsonNode)message).get("tweetID").asText();
				String indicatorTerms = ((JsonNode)message).get("indicatorTerms").asText();
				
				List<String> termList = new ArrayList<String>();
				for (String term : indicatorTerms.split(",")) {
					if (term.length()==0) continue;
					termList.add(term);
				}
				
				StaticDatabase.db.updateIndicatorTermsForTweet(annotatorID, eventIdentifier, tweetID, termList);
				
				{ObjectNode msg = Json.newObject();
				msg.put("messagetype", "indicatorTermsSaved");
				msg.put("indicatorTerms", indicatorTerms);
				out.write(msg);}
			}
			
			// setPriority()
			if (requestType.equalsIgnoreCase("setPriority")) {
				String annotatorID = ((JsonNode)message).get("annotatorID").asText();
				String eventIdentifier = ((JsonNode)message).get("eventIdentifier").asText();
				String tweetID = ((JsonNode)message).get("tweetID").asText();
				String priority = ((JsonNode)message).get("priority").asText();
				
				StaticDatabase.db.setPriorityForTweet(annotatorID, eventIdentifier, tweetID, priority);
				
				{ObjectNode msg = Json.newObject();
				msg.put("messagetype", "prioritySaved");
				out.write(msg);}
			}
			
			// requestRelatedTweets()
			if (requestType.equalsIgnoreCase("requestRelatedTweets")) {
				String annotatorID = ((JsonNode)message).get("annotatorID").asText();
				String eventIdentifier = ((JsonNode)message).get("eventIdentifier").asText();
				String tweetID = ((JsonNode)message).get("tweetID").asText();
				String indicatorTerms = ((JsonNode)message).get("indicatorTerms").asText();
				
				System.err.println("Searching for '"+indicatorTerms+"'");
				
				List<String> termList = new ArrayList<String>();
				for (String term : indicatorTerms.split(",")) {
					if (term.length()==0) continue;
					termList.add(term);
				}
				
				StaticDatabase.db.findRelatedTweets(annotatorID, eventIdentifier, tweetID, termList, out);
				
			}
			
			// requestRelatedTweets()
			if (requestType.equalsIgnoreCase("saveAnnotation")) {
				String annotatorID = ((JsonNode)message).get("annotatorID").asText();
				String eventIdentifier = ((JsonNode)message).get("eventIdentifier").asText();
				String tweetID = ((JsonNode)message).get("tweetID").asText();
				String indicatorTerms = ((JsonNode)message).get("indicatorTerms").asText();
				String currentCategories = ((JsonNode)message).get("currentCategories").asText();
				String priority = ((JsonNode)message).get("priority").asText();
				
				List<String> termList = new ArrayList<String>();
				for (String term : indicatorTerms.split(",")) {
					if (term.length()==0) continue;
					termList.add(term);
				}
				
				List<String> catList = new ArrayList<String>();
				for (String term : currentCategories.split(",")) {
					if (term.length()==0) continue;
					catList.add(term);
				}
				
				StaticDatabase.db.markTweetWithAllDetails(annotatorID, eventIdentifier, tweetID, catList, termList, priority);
				
			}
			
			if (requestType.equalsIgnoreCase("writeUserAndAnnotationsToDisk")) {
				String annotatorID = ((JsonNode)message).get("annotatorID").asText();
				StaticDatabase.db.writeUserAndAnnotationsToDisk(annotatorID);
			}
			
			
			
		}
		
		// internal messages
		if (message instanceof JsonObject) {
			String requestType = ((JsonObject)message).get("messagetype").getAsString();

			if (requestType.equalsIgnoreCase("close")) {
								
			}
							
		}
		
	}
	
	
	//-------------------------------------------------------
	// Support methods
	//-------------------------------------------------------
	
	public boolean registerEventWithUser(String annotatorID, String eventIdentifier) {
		
		List<TRECISEvent> events = streamSimulatorConnector.getFullEventList();
		for (TRECISEvent event : events) {
			if (event.getIdentifier().equalsIgnoreCase(eventIdentifier)) {
				event.setAnnotationTableName(annotatorID+"-"+eventIdentifier);
				StaticDatabase.db.registerEventWithUser(annotatorID, event);
				return true;
			}
		}
		return false;
		
	}
	
	public void getNextTweetForUser(Object message) {
		
		String annotatorID = ((JsonNode)message).get("annotatorID").asText();
		String eventIdentifier = ((JsonNode)message).get("eventIdentifier").asText();
		
		String tweetJSONORNull = StaticDatabase.db.getNextTweetForUserInEvent(annotatorID, eventIdentifier);
		int remaining = StaticDatabase.db.getRemainingForUserInEvent(annotatorID, eventIdentifier);
		
		String eventType = "default";
		for (String typename : ontologies.keySet()) {
			if (eventIdentifier.toLowerCase().contains(typename.toLowerCase())) eventType=typename;
		}
		
		if (tweetJSONORNull==null) {
			{ObjectNode msg = Json.newObject();
			msg.put("messagetype", "statusMessage");
			msg.put("text", "All tweets for event "+eventIdentifier+" have been annotated, event annotation complete");
			out.write(msg);}
		} else {
			{ObjectNode msg = Json.newObject();
			msg.put("messagetype", "nextTweet");
			msg.put("tweetJSON", tweetJSONORNull);
			msg.put("categoriesJSON", ontologies.get(eventType));
			msg.put("remaining", String.valueOf(remaining));
			out.write(msg);}
		}
		
	}
	
	
		
	
}
