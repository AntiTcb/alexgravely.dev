<script lang="ts">
	// Live "years, months, days, ..." counter since a calendar date ("YYYY-MM-DD").
	let { since }: { since: string } = $props();

	const [y, m, d] = since.split("-").map(Number);
	const start = new Date(y, m - 1, d);

	let text = $state("...");

	function elapsed(now: Date): string {
		let years = now.getFullYear() - start.getFullYear();
		let months = now.getMonth() - start.getMonth();
		let days = now.getDate() - start.getDate();
		let hours = now.getHours() - start.getHours();
		let minutes = now.getMinutes() - start.getMinutes();
		let seconds = now.getSeconds() - start.getSeconds();

		if (seconds < 0) (seconds += 60), minutes--;
		if (minutes < 0) (minutes += 60), hours--;
		if (hours < 0) (hours += 24), days--;
		if (days < 0) {
			// Borrow the length of the month before `now`'s month.
			days += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
			months--;
		}
		if (months < 0) (months += 12), years--;

		return `${years} year(s), ${months} month(s), ${days} day(s), ${hours} hour(s), ${minutes} minute(s), and ${seconds} second(s).`;
	}

	$effect(() => {
		text = elapsed(new Date());
		const timer = setInterval(() => (text = elapsed(new Date())), 1000);
		return () => clearInterval(timer);
	});
</script>

<span>{text}</span>
