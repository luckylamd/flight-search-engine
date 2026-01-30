import { NextResponse } from "next/server";
import { searchFlights } from "@/lib/api/amadeus";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);

    const origin = searchParams.get("origin") ?? "";
    const destination = searchParams.get("destination") ?? "";
    const departureDate = searchParams.get("departureDate") ?? "";
    const adultsParam = searchParams.get("adults") ?? "1";

    const adults = Number(adultsParam) || 1;

    if (!origin || !destination || !departureDate) {
        return NextResponse.json(
            { error: "origin, destination and departureDate are required" },
            { status: 400 },
        );
    }

    try {
        const { flights, hourlyPrices } = await searchFlights({
            origin,
            destination,
            departureDate,
            adults,
        });        

        return NextResponse.json({ flights, hourlyPrices });
    } catch (error) {
        console.error("[/api/flights] Error", error);
        return NextResponse.json(
            { error: "Failed to fetch flights from Amadeus" },
            { status: 500 },
        );
    }
}


