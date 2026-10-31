export type CommunityEvent = {
  _id: string;
  title: string;
  description: string;
  eventType: string;
  thumbnailUrl?: string;
  location: string;
  eventDate: string;
  creatorEmail?: string;
  organizer?: {
    name: string | null;
    image: string | null;
    emailVerified: boolean;
  } | null;
};

export type EventVolunteer = {
  name: string;
  image?: string;
};

export type EventVolunteerList = {
  count: number;
  volunteers: EventVolunteer[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseEvent(value: unknown): CommunityEvent | null {
  if (!isRecord(value)) return null;

  const {
    _id,
    title,
    description,
    eventType,
    thumbnailUrl,
    location,
    eventDate,
    creatorEmail,
    organizer,
  } = value;
  if (
    typeof _id !== "string" ||
    typeof title !== "string" ||
    typeof description !== "string" ||
    typeof eventType !== "string" ||
    typeof location !== "string" ||
    typeof eventDate !== "string" ||
    !Number.isFinite(Date.parse(eventDate))
  ) {
    return null;
  }

  return {
    _id,
    title,
    description,
    eventType,
    thumbnailUrl: typeof thumbnailUrl === "string" ? thumbnailUrl : undefined,
    location,
    eventDate,
    creatorEmail:
      typeof creatorEmail === "string" ? creatorEmail : undefined,
    organizer:
      isRecord(organizer) &&
      (typeof organizer.name === "string" || organizer.name === null) &&
      (typeof organizer.image === "string" || organizer.image === null) &&
      typeof organizer.emailVerified === "boolean"
        ? {
            name: organizer.name,
            image: organizer.image,
            emailVerified: organizer.emailVerified,
          }
        : null,
  };
}

function getApiUrl(path: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  return new URL(path, baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`);
}

export async function getEvents(): Promise<CommunityEvent[]> {
  const response = await fetch(getApiUrl("api/events"), {
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    throw new Error(`The events service returned status ${response.status}.`);
  }

  const data: unknown = await response.json();
  if (
    !isRecord(data) ||
    data.success !== true ||
    !Array.isArray(data.events)
  ) {
    throw new Error("The events service returned an invalid response.");
  }

  const events = data.events.map(parseEvent);
  if (events.some((event) => event === null)) {
    throw new Error("The events service returned an invalid event.");
  }

  return events.filter((event): event is CommunityEvent => event !== null);
}

export async function getEventById(id: string): Promise<CommunityEvent | null> {
  const response = await fetch(
    getApiUrl(`api/events/${encodeURIComponent(id)}`),
    { next: { revalidate: 60 } },
  );

  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`The events service returned status ${response.status}.`);
  }

  const data: unknown = await response.json();
  if (!isRecord(data) || data.success !== true) {
    throw new Error("The events service returned an invalid response.");
  }

  const event = parseEvent(data.event);
  if (!event) {
    throw new Error("The events service returned an invalid event.");
  }

  return event;
}

export async function getEventVolunteers(
  id: string,
): Promise<EventVolunteerList> {
  const response = await fetch(
    getApiUrl(`api/participants/event/${encodeURIComponent(id)}`),
    { cache: "no-store" },
  );

  if (!response.ok) {
    throw new Error(`The volunteer service returned status ${response.status}.`);
  }

  const data: unknown = await response.json();
  if (
    !isRecord(data) ||
    data.success !== true ||
    typeof data.count !== "number" ||
    !Number.isInteger(data.count) ||
    data.count < 0 ||
    !Array.isArray(data.volunteers)
  ) {
    throw new Error("The volunteer service returned an invalid response.");
  }

  const volunteers = data.volunteers.map((value): EventVolunteer | null => {
    if (
      !isRecord(value) ||
      typeof value.name !== "string" ||
      (value.image !== undefined && typeof value.image !== "string")
    ) {
      return null;
    }

    return {
      name: value.name,
      image: typeof value.image === "string" ? value.image : undefined,
    };
  });

  if (volunteers.some((volunteer) => volunteer === null)) {
    throw new Error("The volunteer service returned an invalid volunteer.");
  }

  return {
    count: data.count,
    volunteers: volunteers.filter(
      (volunteer): volunteer is EventVolunteer => volunteer !== null,
    ),
  };
}

export function getFutureEvents(events: CommunityEvent[], now = Date.now()) {
  return events
    .filter((event) => Date.parse(event.eventDate) > now)
    .sort((a, b) => Date.parse(a.eventDate) - Date.parse(b.eventDate));
}
