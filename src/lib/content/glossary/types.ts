export interface GlossaryEntry {
	/** unique kebab-case key, e.g. "homeomorphism" */
	key: string;
	/** display name, e.g. "Homeomorphism" */
	term: string;
	/**
	 * One to three plain sentences. May contain \( … \) math, *emphasis* and **strong**.
	 * Write it for a reader who has only read up to the chapter where it is introduced.
	 */
	def: string;
	/** chapter id where the term is introduced, e.g. "topology/spaces" */
	chapter: string;
	/** optional id of the element (usually a Definition callout) in that chapter */
	anchor?: string;
	/** related glossary keys */
	see?: string[];
}
