export class Paper {
	constructor(
		public id: string,
		public title: string,
		public authors: string[],
		public abstract: string,
		public tags: string[]
	) {}

	static fromObject(o: any): Paper {
		return new Paper(o.id, o.title, o.authors, o.abstract, o.tags);
	}
}
