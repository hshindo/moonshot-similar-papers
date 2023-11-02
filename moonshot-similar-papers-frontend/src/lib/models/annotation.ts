import { v4 as uuidv4 } from 'uuid';
import type { PdfDocument, PdfPage } from './pdf';

export type PdfAnno = PdfRectAnno | PdfTextAnno;

export class PdfRectAnno {
	id: string;
	page: PdfPage;
	x1: number;
	y1: number;
	x2: number;
	y2: number;

	constructor(id: string, page: PdfPage, x1: number, y1: number, x2: number, y2: number) {
		if (id) this.id = id;
		else this.id = uuidv4();
		this.page = page;
		this.x1 = x1;
		this.y1 = y1;
		this.x2 = x2;
		this.y2 = y2;
	}

	get height(): number {
		return this.y2 - this.y1;
	}

	get width(): number {
		return this.x2 - this.x1;
	}

	move(x: number, y: number) {
		// x, y がrectの中央になるように移動．サイズは変えない．
		const x1 = Math.max(0, Math.min(1, x)) - this.width / 2;
		const y1 = Math.max(0, Math.min(1, y)) - this.height / 2;
		const x2 = x1 + this.width;
		const y2 = y1 + this.height;

		let dx = 0;
		let dy = 0;
		if (x1 < 0) dx = -x1;
		else if (x2 > 1) dx = 1 - x2;
		if (y1 < 0) dy = -y1;
		else if (y2 > 1) dy = 1 - y2;

		this.x1 = x1 + dx;
		this.y1 = y1 + dy;
		this.x2 = x2 + dx;
		this.y2 = y2 + dy;
	}

	scale(x: number, y: number, idx: number) {
		x = Math.max(0, Math.min(1, x));
		y = Math.max(0, Math.min(1, y));
		const xTolerance = 0.01;
		const yTolerance = 0.01;
		if (idx == 0) {
			this.x1 = Math.min(x, this.x2 - xTolerance);
			this.y1 = Math.min(y, this.y2 - yTolerance);
		} else if (idx == 1) {
			this.x1 = Math.min(x, this.x2 - xTolerance);
			this.y2 = Math.max(y, this.y1 + yTolerance);
		} else if (idx == 2) {
			this.x2 = Math.max(x, this.x1 + xTolerance);
			this.y1 = Math.min(y, this.y2 - yTolerance);
		} else if (idx == 3) {
			this.x2 = Math.max(x, this.x1 + xTolerance);
			this.y2 = Math.max(y, this.y1 + yTolerance);
		}
	}

	toString(): string {
		return 'rect';
	}

	toObject() {
		return {
			id: this.id,
			page_index: this.page.index,
			x1: this.x1,
			y1: this.y1,
			x2: this.x2,
			y2: this.y2,
			type: 'rect'
		};
	}

	static fromObject(obj: any, doc: PdfDocument) {
		let id = obj.id;
		let x1 = obj.x1;
		let y1 = obj.y1;
		let x2 = obj.x2;
		let y2 = obj.y2;
		let page_index = obj.page_index;
		let page = doc.getPage(page_index);
		return new PdfRectAnno(id, page, x1, y1, x2, y2);
	}
}

export class PdfTextAnno {
	id: string;
	page: PdfPage;
	x1: number;
	y1: number;
	x2: number;
	y2: number;
	start: number = -1;
	end: number = -1;

	constructor(id: string, page: PdfPage, x1: number, y1: number, x2: number, y2: number) {
		if (id) this.id = id;
		else this.id = uuidv4();
		this.page = page;
		this.x1 = x1;
		this.y1 = y1;
		this.x2 = x2;
		this.y2 = y2;
		const start = page.charIndexAtPos(x1, y1);
		if (start >= 0) {
			const end = page.charIndexAtPos(this.x2, this.y2);
			if (end >= 0) {
				const s = Math.min(start, end);
				const e = Math.max(start, end);
				this.start = s;
				this.end = e;
			}
		}
	}

	toString(): string {
		const strs: string[] = [];
		for (let i = this.start; i <= this.end; i++) {
			const unicode = this.page.unicode(i);
			const s = String.fromCodePoint(unicode);
			if (s !== '\r' && s !== '\n') strs.push(s);
		}
		return strs.join('');
	}

	toObject() {
		return {
			id: this.id,
			page_index: this.page.index,
			x1: this.x1,
			y1: this.y1,
			x2: this.x2,
			y2: this.y2,
			start: this.start,
			end: this.end,
			type: 'text'
		};
	}

	static fromObject(obj: any, doc: PdfDocument) {
		let id = obj.id;
		let x1 = obj.x1;
		let y1 = obj.y1;
		let x2 = obj.x2;
		let y2 = obj.y2;
		let page_index = obj.page_index;
		let page = doc.getPage(page_index);
		return new PdfTextAnno(id, page, x1, y1, x2, y2);
	}
}
