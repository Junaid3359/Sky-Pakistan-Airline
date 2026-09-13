import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { searchFlights } from '../services/bookingService';
import { formatAirport } from '../data/airports';

type Flight = {
  id: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departure: string;
  arrival: string;
  aircraft?: unknown;
  status?: string;
  totalCapacity?: number;
  fares?: Array<{
    code: string;
    name: string;
    base: number;
    totalPerPassenger: number;
    baggageKg?: number;
    taxes?: {
      tax: number;
      airport: number;
      service: number;
      totalExtras: number;
    };
  }>;
};

export default function FlightResults() {
  const loc = useLocation();
  const navigate = useNavigate();

  const [results, setResults] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const params = Object.fromEntries(
      new URLSearchParams(loc.search).entries()
    );

    if (!params.origin || !params.destination || !params.departureDate) {
      setResults([]);
      setError(
        'Please select origin, destination and departure date.'
      );
      return;
    }

    let cancelled = false;

    const loadFlights = async () => {
      try {
        setLoading(true);
        setError('');
        setResults([]);

        console.log('Searching flights with:', params);

        const response = await searchFlights(params);

        console.log('Flight search response:', response);

        if (cancelled) return;

        if (Array.isArray(response)) {
          setResults(response);
        } else {
          console.error(
            'Unexpected flight search response:',
            response
          );

          setResults([]);
          setError(
            'Invalid response received from flight server.'
          );
        }
      } catch (err: any) {
        if (cancelled) return;

        console.error('Flight search error:', err);

        const serverMessage =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          'Unable to search flights.';

        setResults([]);
        setError(serverMessage);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadFlights();

    return () => {
      cancelled = true;
    };
  }, [loc.search]);

  const handleSelectFlight = (flightId: string) => {
    navigate(`/book/${flightId}`);
  };

  return (
    <div>
      <h2 className="display-font mb-2 text-3xl font-extrabold text-[#102b44]">
        Available flights
      </h2>

      <p className="mb-6 text-[#71808c]">
        Choose your route and fare, then select your seat.
      </p>

      {loading && (
        <div className="rounded bg-white p-6 text-center shadow">
          <p className="font-semibold text-[#102b44]">
            Searching flights...
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Please wait while we find available flights.
          </p>
        </div>
      )}

      {!loading && error && (
        <div className="rounded border border-red-200 bg-red-50 p-6 text-center">
          <p className="font-semibold text-red-700">
            Flight search failed
          </p>

          <p className="mt-2 text-sm text-red-600">
            {error}
          </p>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-4 rounded bg-red-600 px-5 py-2 text-sm font-semibold text-white"
          >
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && results.length > 0 && (
        <div className="grid gap-4">
          {results.map((flight) => {
            const firstFare = flight.fares?.[0];

            return (
              <div
                key={flight.id}
                className="flex flex-col justify-between gap-4 rounded bg-white p-4 shadow md:flex-row md:items-center"
              >
                <div>
                  <div className="font-semibold text-[#102b44]">
                    {flight.flightNumber} —{' '}
                    {formatAirport(flight.origin)} →{' '}
                    {formatAirport(flight.destination)}
                  </div>

                  <div className="mt-1 text-sm text-gray-600">
                    Departs:{' '}
                    {new Date(
                      flight.departure
                    ).toLocaleString()}
                  </div>

                  <div className="text-sm text-gray-600">
                    Arrives:{' '}
                    {new Date(
                      flight.arrival
                    ).toLocaleString()}
                  </div>

                  {flight.status && (
                    <div className="mt-1 text-xs font-semibold text-gray-500">
                      Status: {flight.status}
                    </div>
                  )}
                </div>

                <div className="text-left md:text-right">
                  {firstFare ? (
                    <>
                      <div className="font-bold text-[#102b44]">
                        From{' '}
                        {firstFare.totalPerPassenger.toLocaleString()}{' '}
                        PKR
                      </div>

                      <div className="mt-1 text-xs text-gray-500">
                        {firstFare.name}
                      </div>
                    </>
                  ) : (
                    <div className="font-semibold text-gray-500">
                      Fare information unavailable
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      handleSelectFlight(flight.id)
                    }
                    className="mt-2 rounded bg-sky-600 px-4 py-2 text-white"
                  >
                    Select
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading &&
        !error &&
        results.length === 0 && (
          <div className="border border-dashed border-[#cbd6dc] bg-white p-8 text-center text-[#71808c]">
            <p className="font-semibold text-[#102b44]">
              No flights found for this route and date.
            </p>

            <p className="mt-1 text-sm">
              Try another destination or departure date.
            </p>
          </div>
        )}
    </div>
  );
}