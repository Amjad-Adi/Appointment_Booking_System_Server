export function getUtcDateRangeForLocalDate(
    date: string,
    timeZone: string,
): {
    startUTC: string;
    endUTC: string;
} {
    const nextDate =
        getNextDate(date);

    return {
        startUTC:
            getUtcForLocalDateTime(
                date,
                "00:00:00",
                timeZone,
            ),

        endUTC:
            getUtcForLocalDateTime(
                nextDate,
                "00:00:00",
                timeZone,
            ),
    };
}

function getNextDate(
    date: string,
): string {
    const [
        year,
        month,
        day,
    ] = date
        .split("-")
        .map(Number);

    const next =
        new Date(
            Date.UTC(
                year,
                month - 1,
                day + 1,
            ),
        );

    return next
        .toISOString()
        .slice(0, 10);
}

function getUtcForLocalDateTime(
    date: string,
    time: string,
    timeZone: string,
): string {
    /*
     * Start with the requested local clock
     * represented as UTC.
     *
     * We then calculate the timezone offset
     * represented by that instant.
     */
    const assumedUTC =
        new Date(
            `${date}T${time}.000Z`,
        );

    const parts =
        new Intl.DateTimeFormat(
            "en-US",
            {
                timeZone,
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hourCycle: "h23",
            },
        ).formatToParts(
            assumedUTC,
        );

    const values =
        Object.fromEntries(
            parts
                .filter(
                    (part) =>
                        part.type !==
                        "literal",
                )
                .map(
                    (part) => [
                        part.type,
                        part.value,
                    ],
                ),
        );

    const representedUTC =
        Date.UTC(
            Number(values.year),
            Number(values.month) - 1,
            Number(values.day),
            Number(values.hour),
            Number(values.minute),
            Number(values.second),
        );

    const offset =
        representedUTC -
        assumedUTC.getTime();

    return new Date(
        assumedUTC.getTime() -
        offset,
    ).toISOString();
}