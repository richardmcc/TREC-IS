package dataimport;

import java.io.BufferedReader;
import java.io.FileInputStream;
import java.io.FileReader;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.zip.GZIPInputStream;

import actors.trecis.ontology.StaticDatabase;
import actors.trecis.ontology.TRECISAnnotation;
import actors.trecis.ontology.TRECISAnnotator;
import actors.trecis.ontology.TRECISDatabase;
import actors.trecis.ontology.TRECISEvent;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

public class ImportV0Labelling {

	public static void main(String[] args) {
		
		String labelFile = "/local/tr.kba/TRECIS/Ontologies/EmergencyInformation.v1.labels";
		
		String[] jsonFiles = {"/local/tr.kba/TRECIS/Datasets/CrisisLexT26/2012_Colorado_wildfires/2012_Colorado_wildfires-tweetids_entire_period.csv.json.gz",
		                      "/local/tr.kba/TRECIS/Datasets/CrisisLexT26/2013_Glasgow_helicopter_crash/2013_Glasgow_helicopter_crash-tweetids_entire_period.csv.json.gz"};
		
		
		// Create Events for richardm
		TRECISEvent fireColorado2012 = new TRECISEvent();
		fireColorado2012.setAnnotationTableName("richardm-fireColorado2012");
		fireColorado2012.setName("CrisisLex26 2012 Colorado wildfires");
		fireColorado2012.setDescription("The 2012 Colorado wildfires were an unusually devastating series of Colorado wildfires, including several separate fires that occurred throughout June, July, and August 2012. At least 34,500 residents were evacuated in June.");
		fireColorado2012.setType("Wildfire");
		fireColorado2012.setImageURL("https://upload.wikimedia.org/wikipedia/commons/e/ec/High_Park_Wildfire_Arapaho_and_Roosevelt_National_Forests_June_10%2C_2012.jpg");
		fireColorado2012.setIdentifier("fireColorado2012");
		
		Map<String,String> tweetsAnnotated = new HashMap<String,String>();
		Map<String,String> tweetsLabelled = new HashMap<String,String>();
		
		JsonParser parser = new JsonParser();
		try {
			BufferedReader br = new BufferedReader(new FileReader(labelFile));
			String line;
			while ((line = br.readLine())!=null) {
				String[] parts = line.split("\t");
				String tweetid = parts[0];
				//String topLevelCat = parts[1];
				//String secondLevelCat = parts[2];
				//String thirdLevelCat = parts[3];
				//String keywords = parts[4];
				tweetsLabelled.put(tweetid, line);
			}
			br.close();
			
			
			for (String tweetFile : jsonFiles) {
				br = new BufferedReader(new InputStreamReader(new GZIPInputStream(new FileInputStream(tweetFile)),"UTF-8"));
				br.readLine();
				while ((line = br.readLine())!=null) {
					JsonObject jsonTweet = parser.parse(line).getAsJsonObject();
					String tweetid = jsonTweet.get("id_str").getAsString();
					if (!tweetsLabelled.containsKey(tweetid)) continue;
					tweetsAnnotated.put(tweetid, line);
				}
				br.close();
			}
			
			
			
		} catch (Exception e) {
			e.printStackTrace();
		}
		
		TRECISDatabase db = StaticDatabase.db;
		
		db.registerEventWithUser("richardm", fireColorado2012);
		
		for (String tweetid : tweetsLabelled.keySet()) {
			if (!tweetsAnnotated.containsKey(tweetid)) {
				System.err.println("Could not get tweet json for tweet "+tweetid);
				continue;
			}
			
			if (!tweetid.startsWith("21")) continue;
			
			JsonObject jsonTweet = parser.parse(tweetsAnnotated.get(tweetid)).getAsJsonObject();
			String text = jsonTweet.get("text").getAsString();
			
			String[] labelParts = tweetsLabelled.get(tweetid).split("\t");
			if (labelParts.length<5) continue;
			
			
			TRECISAnnotation annotation = new TRECISAnnotation();
			annotation.setPostID(tweetid);
			annotation.setText(text);
			
			List<String> categories = new ArrayList<String>();
			categories.add(labelParts[1]+"-"+labelParts[2]+"-"+labelParts[3]);
			annotation.setCategories(categories);
			
			List<String> indicatorterms  = new ArrayList<String>();
			for (String term : labelParts[4].split(",")) indicatorterms.add(term);
			annotation.setIndicatorTerms(indicatorterms);
			
			annotation.setTimestamp("Not Recorded");
			
			annotation.setPriority("Unknown");
			
			
			db.saveAnnotation(annotation, fireColorado2012.getAnnotationTableName(), "richardm");
		}
		
	}
	
}
