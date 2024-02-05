export const formatDateTimeNew = (stamp) => {
    const date = new Date(stamp);
    const year = date.getUTCFullYear();
    const month = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(date);
    const day = date.getUTCDate();
    let hours = date.getUTCHours();
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    
    // Determine whether it's AM or PM
    const amOrPm = hours >= 12 ? 'PM' : 'AM';

    // Convert to 12-hour format
    if (hours > 12) {
        hours -= 12;
    } else if (hours === 0) {
        hours = 12;
    }

    const formattedDateTime = `${day} ${month} ${year} at ${hours}:${minutes} ${amOrPm}`;

    return formattedDateTime;
};
