import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
	$createParagraphNode,
	$getNearestNodeFromDOMNode,
	$insertNodes,
	$isRootOrShadowRoot,
	$isTextNode,
	$isElementNode,
} from "lexical";
import { $wrapNodeInElement } from "@lexical/utils";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { $createMediaNode } from "../nodes/MediaNode";

type FileDropPluginProps = {
	uploadFile: (file: File) => Promise<string>;
};

export default function FileDropPlugin({ uploadFile }: FileDropPluginProps) {
	const [editor] = useLexicalComposerContext();
	const isMounted = useRef(true);

	useEffect(() => {
		const rootElement = editor.getRootElement();
		if (!rootElement) return;

		let dragCounter = 0;

		const handleDragEnter = (e: DragEvent) => {
			e.preventDefault();
			dragCounter++;
			if (dragCounter === 1) {
				rootElement.classList.add("drag-over");
			}
		};

		const handleDragLeave = (e: DragEvent) => {
			e.preventDefault();
			dragCounter--;
			if (dragCounter === 0) {
				rootElement.classList.remove("drag-over");
			}
		};

		const handleDragOver = (e: DragEvent) => {
			e.preventDefault();
			if (e.dataTransfer) {
				e.dataTransfer.dropEffect = "copy";
			}
		};

		const handleDrop = async (e: DragEvent) => {
			e.preventDefault();
			dragCounter = 0;
			rootElement.classList.remove("drag-over");

			const files = Array.from(e.dataTransfer?.files || []);
			if (files.length === 0) return;

			const invalid = files.find(
				(f) => !f.type.startsWith("image/") && !f.type.startsWith("video/"),
			);
			if (invalid) {
				toast.error(`Unsupported file type: ${invalid.name}`);
				return;
			}

			const dropX = e.clientX;
			const dropY = e.clientY;

			for (const file of files) {
				if (!isMounted.current) break;

				try {
					const src = await uploadFile(file);
					if (!src || !isMounted.current) continue;

					editor.update(() => {
						const range = document.caretRangeFromPoint(dropX, dropY);
						if (range) {
							const node = $getNearestNodeFromDOMNode(range.startContainer);
							if (node && ($isTextNode(node) || $isElementNode(node))) {
								node.select(range.startOffset, range.startOffset);
							}
						}

						const mediaNode = $createMediaNode(
							src,
							file.name,
							file.type.startsWith("video/") ? "video" : "image",
						);

						if ($isRootOrShadowRoot(mediaNode.getParentOrThrow())) {
							$wrapNodeInElement(mediaNode, $createParagraphNode).selectEnd();
						}

						$insertNodes([mediaNode]);
					});
				} catch {
					toast.error(`Failed to upload: ${file.name}`);
				}
			}
		};

		rootElement.addEventListener("dragenter", handleDragEnter);
		rootElement.addEventListener("dragleave", handleDragLeave);
		rootElement.addEventListener("dragover", handleDragOver);
		rootElement.addEventListener("drop", handleDrop);

		return () => {
			isMounted.current = false;
			rootElement.removeEventListener("dragenter", handleDragEnter);
			rootElement.removeEventListener("dragleave", handleDragLeave);
			rootElement.removeEventListener("dragover", handleDragOver);
			rootElement.removeEventListener("drop", handleDrop);
			rootElement.classList.remove("drag-over");
		};
	}, [editor, uploadFile]);

	return (
		<style>{`
			.drag-over {
				outline: 2px dashed hsl(217, 91%, 60%);
				outline-offset: -2px;
				background-color: hsl(217, 91%, 60% / 0.05);
			}
		`}</style>
	);
}
