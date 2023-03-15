import {saveAs} from 'file-saver';
import JSZip from 'jszip';
import * as _ from 'lamb';

/* zip */

export const getZippedFiles = async files => {
	const zipper = new JSZip();

	_.pairs(files)
	.forEach(([name, content]) => zipper.file(name, content));

	const zipBlob = await zipper.generateAsync({type: 'blob'});

	return zipBlob;
}

export const initiateZippedDownload = async (zipName, files) => {
	const content = await getZippedFiles(files);
	saveAs(content, zipName);
}
