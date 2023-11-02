import { Rect } from './rect';

declare global {
	class Module {
		static HEAPU8: any;
		static HEAPF32: any;
		static HEAPF64: any;
		static getValue(ptr: number, type: string);
		static _malloc(ptr: number): number;
		static _free(ptr: number): void;
		static cwrap: any;
	}
}

// Page rendering flags. They can be combined with bit-wise OR.
// @see https://pdfium.googlesource.com/pdfium/+/refs/heads/main/public/fpdfview.h#764
const FPDF_ANNOT = 0x01;
const FPDF_NO_NATIVETEXT = 0x04;
const FPDF_REVERSE_BYTE_ORDER = 0x10;

let FPDF_InitLibrary;
let FPDF_DestroyLibrary;
let FPDF_LoadMemDocument;
let FPDF_CloseDocument;
let FPDF_GetLastError;
let FPDF_GetPageCount;
let FPDF_LoadPage;
let FPDF_ClosePage;
let FPDF_GetPageWidthF;
let FPDF_GetPageHeightF;
let FPDF_RenderPageBitmap;
let FPDFBitmap_Create;
let FPDFBitmap_Destroy;
let FPDFBitmap_FillRect;
let FPDFBitmap_GetStride;
let FPDFBitmap_GetBuffer;
let FPDFText_LoadPage;
let FPDFText_ClosePage;
let FPDFText_CountChars;
let FPDFText_GetUnicode;
let FPDFText_GetFontSize;
let FPDFText_GetLooseCharBox;
let FPDFText_GetCharBox;
let FPDFText_GetCharIndexAtPos;
let FPDFText_CountRects;
let FPDFText_GetRect;
let initFPDF = false;

function initializeFPDF() {
	FPDF_InitLibrary = Module.cwrap('FPDF_InitLibrary', null, null);
	FPDF_DestroyLibrary = Module.cwrap('FPDF_DestroyLibrary', null, null);
	FPDF_LoadMemDocument = Module.cwrap('FPDF_LoadMemDocument', 'number', ['number', 'number']);
	FPDF_CloseDocument = Module.cwrap('FPDF_CloseDocument', null, ['number']);
	FPDF_GetLastError = Module.cwrap('FPDF_GetLastError', 'number', []);
	FPDF_GetPageCount = Module.cwrap('FPDF_GetPageCount', 'number', ['number']);
	FPDF_LoadPage = Module.cwrap('FPDF_LoadPage', 'number', ['number', 'number']);
	FPDF_ClosePage = Module.cwrap('FPDF_ClosePage', null, ['number']);
	FPDF_GetPageWidthF = Module.cwrap('FPDF_GetPageWidthF', 'number', ['number']);
	FPDF_GetPageHeightF = Module.cwrap('FPDF_GetPageHeightF', 'number', ['number']);
	FPDF_RenderPageBitmap = Module.cwrap('FPDF_RenderPageBitmap', null, [
		'number',
		'number',
		'number',
		'number',
		'number',
		'number',
		'number',
		'number'
	]);
	FPDFBitmap_Create = Module.cwrap('FPDFBitmap_Create', 'number', ['number', 'number', 'number']);
	FPDFBitmap_Destroy = Module.cwrap('FPDFBitmap_Destroy', null, ['number']);
	FPDFBitmap_FillRect = Module.cwrap('FPDFBitmap_FillRect', null, [
		'number',
		'number',
		'number',
		'number',
		'number',
		'number'
	]);
	FPDFBitmap_GetStride = Module.cwrap('FPDFBitmap_GetStride', 'number', ['number']);
	FPDFBitmap_GetBuffer = Module.cwrap('FPDFBitmap_GetBuffer', 'number', ['number']);
	FPDFText_LoadPage = Module.cwrap('FPDFText_LoadPage', 'number', ['number']);
	FPDFText_ClosePage = Module.cwrap('FPDFText_ClosePage', null, ['number']);
	FPDFText_CountChars = Module.cwrap('FPDFText_CountChars', 'number', ['number']);
	FPDFText_GetUnicode = Module.cwrap('FPDFText_GetUnicode', 'number', ['number', 'number']);
	FPDFText_GetFontSize = Module.cwrap('FPDFText_GetFontSize', 'number', ['number', 'number']);
	FPDFText_GetLooseCharBox = Module.cwrap('FPDFText_GetLooseCharBox', 'number', [
		'number',
		'number',
		'number'
	]);
	FPDFText_GetCharBox = Module.cwrap('FPDFText_GetCharBox', 'number', [
		'number',
		'number',
		'number',
		'number',
		'number',
		'number'
	]);
	FPDFText_GetCharIndexAtPos = Module.cwrap('FPDFText_GetCharIndexAtPos', 'number', [
		'number',
		'number',
		'number',
		'number',
		'number'
	]);
	FPDFText_CountRects = Module.cwrap('FPDFText_CountRects', 'number', [
		'number',
		'number',
		'number'
	]);
	FPDFText_GetRect = Module.cwrap('FPDFText_GetRect', 'number', [
		'number',
		'number',
		'number',
		'number',
		'number',
		'number'
	]);

	FPDF_InitLibrary();
	initFPDF = true;
}

export class PdfDocument {
	name: string;
	wasmPtr: number;
	ptr: number;
	private pages: PdfPage[];
	private images: ImageData[];

	constructor(name: string, data: Uint8Array) {
		if (!initFPDF) initializeFPDF();
		this.name = name;

		// Module.HEAPU8: wasm側のメモリで，malloc, freeで確保と解放．setでjs側からコピー（view？）
		const wasmPtr = Module._malloc(data.length);
		this.wasmPtr = wasmPtr;
		Module.HEAPU8.set(data, wasmPtr);
		this.ptr = FPDF_LoadMemDocument(wasmPtr, data.length);
		const pageCount = FPDF_GetPageCount(this.ptr);
		this.pages = new Array(pageCount);
		this.images = new Array(pageCount);
	}

	close() {
		for (const page of this.pages) {
			if (page) page.close();
		}
		FPDF_CloseDocument(this.ptr);
		Module._free(this.wasmPtr);
		this.ptr = undefined;
		this.wasmPtr = undefined;
		// FPDF_DestroyLibrary();
	}

	getPage(index: number): PdfPage {
		let page = this.pages[index];
		if (page) return page;
		page = new PdfPage(index, FPDF_LoadPage(this.ptr, index));
		this.pages[index] = page;
		return page;
	}

	get pageCount(): number {
		return this.pages.length;
	}

	render(pageIndex: number, scale: number): ImageData {
		if (this.images[pageIndex]) return this.images[pageIndex];
		const pagePtr = FPDF_LoadPage(this.ptr, pageIndex);
		const width = Math.floor(FPDF_GetPageWidthF(pagePtr) * scale);
		const height = Math.floor(FPDF_GetPageHeightF(pagePtr) * scale);
		const bitmapPtr = FPDFBitmap_Create(width, height, 0);
		FPDFBitmap_FillRect(bitmapPtr, 0, 0, width, height, 0xffffffff); // white: 0xFFFFFFFF, black: 0xff000000
		FPDF_RenderPageBitmap(bitmapPtr, pagePtr, 0, 0, width, height, 0, FPDF_REVERSE_BYTE_ORDER);
		const buffer = FPDFBitmap_GetBuffer(bitmapPtr);
		const bitmap = new Uint8Array(Module.HEAPU8.buffer, buffer, width * height * 4); // copyではなくview
		const clamped = new Uint8ClampedArray(bitmap); // copyのはず
		this.images[pageIndex] = new ImageData(clamped, width, height);
		Module._free(buffer);
		FPDFBitmap_Destroy(bitmapPtr);
		FPDF_ClosePage(pagePtr);
		return this.images[pageIndex];
	}
}

export class PdfPage {
	index: number;
	ptr: number;
	textPtr: number;
	width: number;
	height: number;

	constructor(index: number, ptr: number) {
		if (!initFPDF) initializeFPDF();
		this.index = index;
		this.ptr = ptr;
		this.textPtr = FPDFText_LoadPage(ptr);
		this.width = FPDF_GetPageWidthF(this.ptr);
		this.height = FPDF_GetPageHeightF(this.ptr);
	}

	close() {
		if (this.ptr) {
			FPDF_ClosePage(this.ptr);
			this.ptr = undefined;
		}
		if (this.textPtr) {
			FPDFText_ClosePage(this.textPtr);
			this.textPtr = undefined;
		}
	}

	charCount(): number {
		return FPDFText_CountChars(this.textPtr);
	}

	// Get the index of a character at or nearby a certain position on the page.
	// xTolerance and yTolerance are in user space.
	charIndexAtPos(x: number, y: number, xTolerance = 10, yTolerance = 10): number {
		x = x * this.width;
		y = (1 - y) * this.height;
		return FPDFText_GetCharIndexAtPos(this.textPtr, x, y, xTolerance, yTolerance);
	}

	textRects(startIndex: number, count: number): Rect[] {
		// Get the index of a character at or nearby a certain position on the page.
		const numRects = FPDFText_CountRects(this.textPtr, startIndex, count);

		// Get a rectangular area from the result generated by FPDFText_CountRects.
		const ptr = Module._malloc(8 * 4 * numRects);
		let offs = ptr;
		for (let i = 0; i < numRects; i++) {
			FPDFText_GetRect(this.textPtr, i, offs, offs + 8, offs + 16, offs + 24); // ltrb
			offs += 32;
		}
		const boxes = new Float64Array(Module.HEAPF64.buffer, ptr, numRects * 4);

		const rects: Rect[] = new Array(numRects);
		const h = this.height;
		for (let i = 0; i < numRects; i++) {
			const rect = new Rect(
				boxes[i * 4],
				h - boxes[i * 4 + 1],
				boxes[i * 4 + 2],
				h - boxes[i * 4 + 3]
			);
			rects[i] = rect.scale(1 / this.width, 1 / h);
		}
		Module._free(ptr);
		return rects;
	}

	extractChars(): any[] {
		const chars = [];
		const charCount = this.charCount();
		const width = this.width;
		const height = this.height;

		const ptr = Module._malloc(8 * 4 * charCount);
		let offs = ptr;
		for (let i = 0; i < charCount; i++) {
			const unicode = this.unicode(i);
			const s = String.fromCodePoint(unicode);
			//const fontSize = this.fontSize(i);
			const char = { str: s };
			chars.push(char);
			const success = FPDFText_GetCharBox(this.textPtr, i, offs, offs + 8, offs + 16, offs + 24);
			offs += 32;
		}

		const boxes = new Float64Array(Module.HEAPF64.buffer, ptr, charCount * 4);
		for (let i = 0; i < charCount; i++) {
			const c = chars[i];
			// lrbt
			c.x1 = boxes[i * 4] * (1 / width);
			c.x2 = boxes[i * 4 + 1] * (1 / width);
			c.y2 = 1 - boxes[i * 4 + 2] * (1 / height);
			c.y1 = 1 - boxes[i * 4 + 3] * (1 / height);
		}
		Module._free(ptr);
		return chars;
	}

	setLooseCharBox() {
		//rect = self._fs_rectf
		//success = libc.FPDFText_GetLooseCharBox(self.text_ptr, char_index, byref(rect))
		//if success == 1:
		//  return float(rect.left), float(rect.top), float(rect.right), float(rect.bottom)
		//else:
		//  return 0.0, 0.0, 0.0, 0.0
	}

	unicode(charIndex: number): number {
		// If a character is not encoded in Unicode, value will be zero.
		// hyphen at the end of line is encoded as 0x02
		return FPDFText_GetUnicode(this.textPtr, charIndex);
	}

	fontSize(charIndex: number): number {
		return FPDFText_GetFontSize(this.textPtr, charIndex);
	}
}
