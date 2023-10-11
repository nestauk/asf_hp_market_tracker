export const makeOnKeyDown = handlerFn => event => {
	if (event.key === 'Enter') {
		event.preventDefault();
		handlerFn(event);
	}
}
