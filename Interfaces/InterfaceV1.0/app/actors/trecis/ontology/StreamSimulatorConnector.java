package actors.trecis.ontology;

import static javax.ws.rs.client.ClientBuilder.newClient;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map.Entry;
import java.util.stream.Stream;

import javax.ws.rs.core.MediaType;

import org.terrier.superfp7.api.core.in.PostStreamInput;
import org.terrier.superfp7.api.representations.Post;
import org.terrier.superfp7.api.representations.PostStreamSource;
import org.terrier.superfp7.api.representations.StreamDefinition;
import org.terrier.superfp7.api.representations.StreamType;

import play.mvc.WebSocket;
import scheduler.SUPERStreamHandler;
import play.libs.Json;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

public class StreamSimulatorConnector {

	URI simulatorHost;
	JsonParser parser = new JsonParser();
	
	public StreamSimulatorConnector(String host) {
		
		try {
			simulatorHost = new URI(host);
		} catch (URISyntaxException e) {
			e.printStackTrace();
		}
		
	}
	
	public List<TRECISEvent> getFullEventList() {
		
		String jsonReturn = newClient()
		.target(simulatorHost)
		.path("/")
		.request(MediaType.APPLICATION_JSON_TYPE)
		.get(String.class);
		
		List<TRECISEvent> events = new ArrayList<TRECISEvent>();
		
		JsonObject jsonEvents = parser.parse(jsonReturn).getAsJsonObject();
		Iterator<Entry<String,JsonElement>> iterator = jsonEvents.entrySet().iterator();
		while (iterator.hasNext()) {
			Entry<String,JsonElement> entry = iterator.next();
			TRECISEvent event = new TRECISEvent();
			event.setIdentifier(entry.getKey());
			event.setAnnotationTableName(null);
			event.setName(entry.getValue().getAsJsonObject().get("name").getAsString());
			event.setDescription(entry.getValue().getAsJsonObject().get("description").getAsString());
			event.setImageURL(entry.getValue().getAsJsonObject().get("image").getAsString());
			event.setType("Unknown");
			
			events.add(event);
			
		}
		
		return events;
		
	}
	
	/**
	 * Downloads tweets from the stream simulator and then write them out to the local database. This may take a while
	 * so it maintains a socket so status messages can be sent
	 * @param annotatorID
	 * @param eventIdentifier
	 * @param out
	 * @return
	 */
	public int addTweetsForEventToUserQueue(String annotatorID, String eventIdentifier, WebSocket.Out<JsonNode> out) {
		
		int count = 0;
		int reportEveryNTweets = 100;
		int sinceLastReport = 0;
		try {
			StreamDefinition def = new StreamDefinition(eventIdentifier, StreamType.TWEETS, new HashMap<String,String>());
			PostStreamSource source = new PostStreamSource("http://demos.terrier.org/streamsimulator/", Arrays.asList(def));
			source.setHandlerClass("org.terrier.superfp7.api.core.handler.LokiPostStreamHandler");
			
			SUPERStreamHandler handler = new SUPERStreamHandler();
			PostStreamInput in = handler.provide(source);
			
			Stream<Post> stream = in.read();

			Iterator<Post> iterator = stream.iterator();
			
			while (iterator.hasNext()) {
				Post p = iterator.next();
				
				StaticDatabase.db.addTweetToAnnotationQueue(p.getIdentifier(), p.getMetadata().get("srcjson"), annotatorID, eventIdentifier);
				count++;
				sinceLastReport++;
				
				if (sinceLastReport==reportEveryNTweets) {
					
					{ObjectNode msg = Json.newObject();
					msg.put("messagetype", "statusMessage");
					msg.put("text", "Connected to GLA Servers and import is progressing... ("+count+" tweets imported)");
					out.write(msg);}
					
					sinceLastReport=0;
				}
			}
		} catch (Exception e) {
			e.printStackTrace();
			return -1;
		}
		
		return count;
		
	}
	
}
