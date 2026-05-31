import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $wrapNodeInElement, mergeRegister } from "@lexical/utils";
import {
	$createParagraphNode,
	$insertNodes,
	$isRootOrShadowRoot,
	type LexicalCommand,
	createCommand,
} from "lexical";
import { useEffect } from "react";
import { $createMediaNode, MediaNode, type MediaType } from "../nodes/MediaNode";

export type InsertMediaPayload = {
	src: string;
	altText: string;
	type: MediaType;
};

export const INSERT_MEDIA_COMMAND: LexicalCommand<InsertMediaPayload> =
	createCommand("INSERT_MEDIA_COMMAND");

export default function MediaPlugin(): null {
	const [editor] = useLexicalComposerContext();

	useEffect(() => {
		if (!editor.hasNodes([MediaNode])) {
			throw new Error("MediaPlugin: MediaNode not registered on editor");
		}

		return mergeRegister(
			editor.registerCommand<InsertMediaPayload>(
				INSERT_MEDIA_COMMAND,
				(payload) => {
					const mediaNode = $createMediaNode(
						payload.src,
						payload.altText,
						payload.type,
					);

					if ($isRootOrShadowRoot(mediaNode.getParentOrThrow())) {
						$wrapNodeInElement(mediaNode, $createParagraphNode).selectEnd();
					}

					$insertNodes([mediaNode]);
					return true;
				},
				0,
			),
		);
	}, [editor]);

	return null;
}
