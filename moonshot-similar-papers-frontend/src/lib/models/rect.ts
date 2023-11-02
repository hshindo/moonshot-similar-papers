export class Rect {
	constructor(public x1: number, public y1: number, public x2: number, public y2: number) {}

	get height(): number {
		return this.y2 - this.y1;
	}

	get width(): number {
		return this.x2 - this.x1;
	}

	center(): Rect {
		const x = (this.x1 + this.x2) / 2;
		const y = (this.y1 + this.y2) / 2;
		return new Rect(x, y, x, y);
	}

	union(o: Rect): Rect {
		const x1 = Math.min(this.x1, o.x1);
		const y1 = Math.min(this.y1, o.y1);
		const x2 = Math.max(this.x2, o.x2);
		const y2 = Math.max(this.y2, o.y2);
		return new Rect(x1, y1, x2, y2);
	}

	contains(o: Rect): boolean {
		return this.y1 <= o.y1 && o.y2 <= this.y2 && this.x1 <= o.x1 && o.x2 <= this.x2;
	}

	move(w: number, h: number): Rect {
		return new Rect(this.x1 + w, this.y1 + h, this.x2 + w, this.y2 + h);
	}

	scale(scaleX: number, scaleY: number): Rect {
		return new Rect(this.x1 * scaleX, this.y1 * scaleY, this.x2 * scaleX, this.y2 * scaleY);
	}

	overlap_x(o: Rect): number {
		return Math.min(this.x2, o.x2) - Math.max(this.x1, o.x1);
	}

	overlap_y(o: Rect): number {
		return Math.min(this.y2, o.y2) - Math.max(this.y1, o.y1);
	}

	// Rectの大きさを変更した時に自身が指定範囲内に収まるように調整する
	public clip(bbox: Rect): Rect {
		const x1 = this.x1 < bbox.x1 ? bbox.x1 : this.x1;
		const x2 = this.x2 > bbox.x2 ? bbox.x2 : this.x2;
		const y1 = this.y1 < bbox.y1 ? bbox.y1 : this.y1;
		const y2 = this.y2 > bbox.y2 ? bbox.y2 : this.y2;
		return new Rect(x1, y1, x2, y2);
	}
}
