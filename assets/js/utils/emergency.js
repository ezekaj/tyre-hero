/**
 * Generate an estimated arrival window for emergency assistance
 */
export function calculateEstimatedArrival() {
    const minMinutes = 30;
    const maxMinutes = 90;
    const minutes = Math.floor(Math.random() * (maxMinutes - minMinutes + 1)) + minMinutes;

    const eta = new Date(Date.now() + minutes * 60000);
    const formattedTime = eta.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return {
        minutes,
        time: formattedTime
    };
}
