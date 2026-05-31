import type {
	EditorConfig,
	LexicalNode,
	NodeKey,
	SerializedLexicalNode,
	Spread,
} from "lexical";
import { DecoratorNode } from "lexical";
import type React from "react";

export type MediaType = "image" | "video";

export type SerializedMediaNode = Spread<
	{
		src: string;
		altText: string;
		mediaType: MediaType;
		width?: number;
		height?: number;
	},
	SerializedLexicalNode
>;

export class MediaNode extends DecoratorNode<React.ReactNode> {
	__src: string;
	__altText: string;
	__type: MediaType;
	__width?: number;
	__height?: number;

	static getType(): string {
		return "media";
	}

	static clone(node: MediaNode): MediaNode {
		return new MediaNode(
			node.__src,
			node.__altText,
			node.__type,
			node.__width,
			node.__height,
			node.__key,
		);
	}

	constructor(
		src: string,
		altText: string,
		type: MediaType,
		width?: number,
		height?: number,
		key?: NodeKey,
	) {
		super(key);
		this.__src = src;
		this.__altText = altText;
		this.__type = type;
		this.__width = width;
		this.__height = height;
	}

	createDOM(_config: EditorConfig): HTMLElement {
		const span = document.createElement("span");
		return span;
	}

	updateDOM(): false {
		return false;
	}

	decorate(): React.ReactNode {
		if (this.__type === "video") {
			return (
				<video
					src={this.__src}
					controls
					style={{
						maxWidth: "100%",
						borderRadius: "8px",
						margin: "8px 0",
						display: "block",
					}}
				/>
			);
		}

		return (
			<img
				src={this.__src}
				alt={this.__altText}
				width={this.__width}
				height={this.__height}
				style={{
					maxWidth: "100%",
					borderRadius: "8px",
					margin: "8px 0",
					display: "block",
				}}
				draggable={false}
			/>
		);
	}

	exportJSON(): SerializedMediaNode {
		return {
			type: "media",
			src: this.__src,
			altText: this.__altText,
			mediaType: this.__type,
			width: this.__width,
			height: this.__height,
			version: 1,
		};
	}

	static importJSON(serializedNode: SerializedMediaNode): MediaNode {
		return $createMediaNode(
			serializedNode.src,
			serializedNode.altText,
			serializedNode.mediaType,
			serializedNode.width,
			serializedNode.height,
		);
	}
}

export function $createMediaNode(
	src: string,
	altText: string,
	type: MediaType,
	width?: number,
	height?: number,
): MediaNode {
	return new MediaNode(src, altText, type, width, height);
}

export function $isMediaNode(
	node: LexicalNode | null | undefined,
): node is MediaNode {
	return node instanceof MediaNode;
}
