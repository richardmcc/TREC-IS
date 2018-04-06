package actors.trecis.ontology;

import java.util.List;

/**
 * Class Representing a TREC-IS Annotator
 * @author richardm
 *
 */
public class TRECISAnnotator {

	String ID;
	List<TRECISEvent> eventsAnnotated;
	
	public TRECISAnnotator() {};
	
	public String getID() {
		return ID;
	}
	public void setID(String iD) {
		ID = iD;
	}
	public List<TRECISEvent> getEventsAnnotated() {
		return eventsAnnotated;
	}
	public void setEventsAnnotated(List<TRECISEvent> eventsAnnotated) {
		this.eventsAnnotated = eventsAnnotated;
	}
	
	
	
}
