package actors.trecis.ontology;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.util.zip.GZIPInputStream;
import java.util.HashSet;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.Map.Entry;
import java.util.Set;

import com.google.gson.JsonElement;
import com.google.gson.JsonIOException;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.google.gson.JsonSyntaxException;

import play.libs.Json;
import play.mvc.WebSocket;
import akka.actor.UntypedActor;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;

public class OntologyAnnotatorActor extends UntypedActor {

	private final WebSocket.Out<JsonNode> out;
	
	LinkedList<String> tweetsToAnnotate;
	JsonObject ontology;
	String labelFile;
	
	
	public OntologyAnnotatorActor(String ontologyFile, String tweetFile, String labelFile, WebSocket.Out<JsonNode> out) {
		this.out = out;
		
		try {
			JsonParser parser = new JsonParser();
			ontology = parser.parse(new FileReader(ontologyFile)).getAsJsonObject();
		} catch (Exception e) {
			e.printStackTrace();
		}
		
		loadLabelsAndTweets(tweetFile,labelFile);
		
		this.labelFile = labelFile;
	}
	
	public void loadLabelsAndTweets(String tweetFile, String labelFile) {
		tweetsToAnnotate = new LinkedList<String>();
		
		
		try {
			BufferedReader br = new BufferedReader(new FileReader(labelFile));
			String line;
			Set<String> alreadyJudged = new HashSet<String>();
			while ((line = br.readLine())!=null) {
				String[] parts = line.split("\t");
				String tweetid = parts[0];
				//String topLevelCat = parts[1];
				//String secondLevelCat = parts[2];
				//String thirdLevelCat = parts[3];
				//String keywords = parts[4];
				alreadyJudged.add(tweetid);
			}
			br.close();
			
			br = new BufferedReader(new InputStreamReader(new FileInputStream(tweetFile)));
			br.readLine();
			while ((line = br.readLine())!=null) {
				if (!line.contains("Related")) continue;
				String tweetid = line.split(",")[0].replace("\"", "");
				if (alreadyJudged.contains(tweetid)) continue;
				tweetsToAnnotate.add(line);
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
	
	@Override
	public void onReceive(Object message) throws Exception {
	
		if (message instanceof JsonNode) {
			String requestType = ((JsonNode)message).get("messagetype").asText();
			
			
			if (requestType.equalsIgnoreCase("getTopLevelCategories")) {
				StringBuilder topLevelCats = new StringBuilder();
				// top-level types
				for (Entry<String,JsonElement> element : ontology.entrySet()) {
					if (topLevelCats.length()>0) topLevelCats.append(",");
					topLevelCats.append(element.getKey());
				}
				ObjectNode msg = Json.newObject();
				msg.put("messagetype", "topLevelCategories");
				msg.put("categories", topLevelCats.toString());
				out.write(msg);
			}
			
			if (requestType.equalsIgnoreCase("getSecondLevelCategories")) {
				
				String topLevelCategory = ((JsonNode)message).get("topLevelCategory").asText();
				
				StringBuilder secondLevelCats = new StringBuilder();
				// top-level types
				for (Entry<String,JsonElement> element : ontology.get(topLevelCategory).getAsJsonObject().entrySet()) {
					if (secondLevelCats.length()>0) secondLevelCats.append(",");
					secondLevelCats.append(element.getKey());
				}
				ObjectNode msg = Json.newObject();
				msg.put("messagetype", "secondLevelCategories");
				msg.put("categories", secondLevelCats.toString());
				out.write(msg);
			}
			
			if (requestType.equalsIgnoreCase("getThirdLevelCategories")) {
				
				String topLevelCategory = ((JsonNode)message).get("topLevelCategory").asText();
				String secondLevelCategory = ((JsonNode)message).get("secondLevelCategory").asText();
				
				StringBuilder thirdLevelCats = new StringBuilder();
				// top-level types
				Iterator<JsonElement> elements =  ontology.get(topLevelCategory).getAsJsonObject().get(secondLevelCategory).getAsJsonArray().iterator();
				while (elements.hasNext()) {
					String element = elements.next().getAsString();
					if (thirdLevelCats.length()>0) thirdLevelCats.append(",");
					thirdLevelCats.append(element);
				}
				ObjectNode msg = Json.newObject();
				msg.put("messagetype", "thirdLevelCategories");
				msg.put("categories", thirdLevelCats.toString());
				out.write(msg);
			}
			
			if (requestType.equalsIgnoreCase("getNextTweet")) {
				if (tweetsToAnnotate.size()>0) {
					ObjectNode msg = Json.newObject();
					msg.put("messagetype", "nextTweet");
					
					String tweet = tweetsToAnnotate.remove();
					String[] parts = tweet.split("\"");
					String tweetid = parts[1];
					String text = parts[3];
					
					msg.put("tweetid", tweetid);
					msg.put("text", text);
					out.write(msg);
				}
			}
			
			if (requestType.equalsIgnoreCase("saveLabel")) {
				
				String tweetid = ((JsonNode)message).get("tweetid").asText();
				String text = ((JsonNode)message).get("text").asText();
				String topLevelCategory = ((JsonNode)message).get("topLevelCategory").asText();
				String secondLevelCategory = ((JsonNode)message).get("secondLevelCategory").asText();
				String thirdLevelCategory = ((JsonNode)message).get("thirdLevelCategory").asText();
				String generalKeyTerms = ((JsonNode)message).get("generalKeyTerms").asText();
				String eventKeyTerms = ((JsonNode)message).get("eventKeyTerms").asText();
				
				
				try{
					PrintWriter out = new PrintWriter(new BufferedWriter(new FileWriter(labelFile, true)));
					out.println(tweetid+'\t'+topLevelCategory+'\t'+secondLevelCategory+'\t'+thirdLevelCategory+'\t'+generalKeyTerms+'\t'+eventKeyTerms);
					out.close();
				} catch (IOException e) {
				}
			}
			
			
			
			
		}
		
		// internal messages
		if (message instanceof JsonObject) {
			String requestType = ((JsonObject)message).get("messagetype").getAsString();

			if (requestType.equalsIgnoreCase("close")) {
						
			}
					
		}
	}
}
