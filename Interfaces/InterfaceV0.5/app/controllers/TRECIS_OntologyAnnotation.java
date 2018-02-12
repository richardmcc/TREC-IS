package controllers;

import java.util.Random;

import play.Play;
import play.libs.Akka;
import play.libs.F;
import play.libs.Json;
import play.mvc.Controller;
import play.mvc.Result;
import play.mvc.WebSocket;
import actors.trecis.ontology.OntologyAnnotatorActor;
import akka.actor.ActorRef;
import akka.actor.Props;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.google.gson.JsonObject;

public class TRECIS_OntologyAnnotation extends Controller{

	public static String currentDatasetID = "";
	public static long currentStartTime = 0;
	public static double currentSpeedFactor = 0.0;
	
	public static Result index() {
        return ok(views.html.TRECIS_OntologyAnnotator.render());
    }
	
	public static WebSocket<JsonNode> ws() {
		return new WebSocket<JsonNode>() {

			@Override
			public void onReady(play.mvc.WebSocket.In<JsonNode> in,
					play.mvc.WebSocket.Out<JsonNode> out) {
				
				Random r = new Random();
				
				String ontologyFile = Play.application().configuration().getString("trecis.ontologyFile");
				String tweetFile = Play.application().configuration().getString("trecis.tweetFile");
				String labelFile = Play.application().configuration().getString("trecis.labelFile");
				
				final ActorRef trecisActor = Akka.system().actorOf(Props.create(OntologyAnnotatorActor.class, ontologyFile, tweetFile, labelFile, out));

			    final String uniqueKey = currentDatasetID+"-"+r.nextLong();
			    
				ObjectNode jsonMessage = Json.newObject();
				jsonMessage.put("messagetype", "init");
				jsonMessage.put("key", uniqueKey);
				out.write(jsonMessage);
			    
				in.onMessage(new F.Callback<JsonNode>() {
                    @Override
                    public void invoke(JsonNode jsonNode) throws Throwable {
                    	trecisActor.tell(jsonNode,null);
                    }
                });
				
				in.onClose(new F.Callback0() {
                    @Override
                    public void invoke() throws Throwable {
                    	JsonObject jsonroot = new JsonObject();
        				jsonroot.addProperty("messagetype", "close");
        				jsonroot.addProperty("key", uniqueKey);
        				trecisActor.tell(jsonroot, null);
                    	
                    	Thread.sleep(1000);
                 
                    	Akka.system().stop(trecisActor);
                    	
                    }
                });
				
			}
			
		};
    }
}
