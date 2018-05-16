package actors.trecis.ontology;

import java.util.List;

/**
 * Representation of a single TREC-IS assessment
 * @author richardm
 *
 */
public class TRECISAnnotation {

	String postID;
	String timestamp;
	List<String> categories;
	List<String> indicatorTerms;
	String priority;
	
	String text;

	public TRECISAnnotation() {}
	
	public TRECISAnnotation(String postID, String timestamp,
			List<String> categories, List<String> indicatorTerms,
			String priority, String text) {
		super();
		this.postID = postID;
		this.timestamp = timestamp;
		this.categories = categories;
		this.indicatorTerms = indicatorTerms;
		this.priority = priority;
		this.text = text;
	}

	public String getPostID() {
		return postID;
	}

	public void setPostID(String postID) {
		this.postID = postID;
	}

	public String getTimestamp() {
		return timestamp;
	}

	public void setTimestamp(String timestamp) {
		this.timestamp = timestamp;
	}

	public List<String> getCategories() {
		return categories;
	}

	public void setCategories(List<String> categories) {
		this.categories = categories;
	}

	public List<String> getIndicatorTerms() {
		return indicatorTerms;
	}

	public void setIndicatorTerms(List<String> indicatorTerms) {
		this.indicatorTerms = indicatorTerms;
	}

	public String getPriority() {
		return priority;
	}

	public void setPriority(String priority) {
		this.priority = priority;
	}

	public String getText() {
		return text;
	}

	public void setText(String text) {
		this.text = text;
	}
	
	
	
}
