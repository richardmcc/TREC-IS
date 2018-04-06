package actors.trecis.ontology;

import java.util.List;

/**
 * Representation of a TREC-IS event 
 * @author richardm
 *
 */
public class TRECISEvent {

	String identifier;
	String name;
	String description;
	String type;
	String imageURL;
	
	String annotationTableName;

	public TRECISEvent() {}

	public String getIdentifier() {
		return identifier;
	}

	public void setIdentifier(String identifier) {
		this.identifier = identifier;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

	public String getImageURL() {
		return imageURL;
	}

	public void setImageURL(String imageURL) {
		this.imageURL = imageURL;
	}

	public String getAnnotationTableName() {
		return annotationTableName;
	}

	public void setAnnotationTableName(String annotationTableName) {
		this.annotationTableName = annotationTableName;
	}
	
	
	
	
	
	
}
