export const formatTime = (isoString: string) => {
	const date = new Date(isoString);
	const now = new Date();
	const isToday = date.toDateString() === now.toDateString();
	
	if (isToday) {
	  return date.toLocaleTimeString('en-US', { 
		hour: 'numeric', 
		minute: '2-digit',
		hour12: true 
	  });
	} else {
	  return date.toLocaleDateString('en-US', { 
		month: 'short',
		day: 'numeric',
		hour: 'numeric',
		minute: '2-digit',
		hour12: true
	  });
	}
};