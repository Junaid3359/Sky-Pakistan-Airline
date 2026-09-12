import { Request, Response } from 'express';
import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import bwipjs from 'bwip-js';
import { randomUUID } from 'crypto';

import { Booking } from '../models/booking.model';
import { Ticket } from '../models/ticket.model';
import { sendMail } from '../services/mail.service';

function writeTicketPDF(
  doc: any,
  booking: any,
  tickets: any[],
  qrBuffers: Buffer[],
  barcodeBuffers: Buffer[]
) {
  const navy = '#102b44';
  const gold = '#f7b955';
  const muted = '#607080';
  const line = '#d9e1e7';

  const flight = booking.flight || {};

  const customerEmail =
    booking.user?.email ||
    booking.passengers?.[0]?.email ||
    'N/A';

  const airports: Record<string, string> = {
    LHE: 'Lahore - Allama Iqbal International Airport',
    ISB: 'Islamabad - Islamabad International Airport',
    KHI: 'Karachi - Jinnah International Airport',
    MUX: 'Multan - Multan International Airport',
    DXB: 'Dubai - Dubai International Airport',
    LHR: 'London - Heathrow Airport',
    IST: 'Istanbul - Istanbul Airport',
    KUL: 'Kuala Lumpur - Kuala Lumpur International Airport',
    YYZ: 'Toronto - Toronto Pearson International Airport',
    MLE: 'Male - Velana International Airport',
    DOH: 'Doha - Hamad International Airport',
    JED: 'Jeddah - King Abdulaziz International Airport',
    RUH: 'Riyadh - King Khalid International Airport',
    BKK: 'Bangkok - Suvarnabhumi Airport',
    SIN: 'Singapore - Changi Airport',
    BOM: 'Mumbai - Chhatrapati Shivaji Maharaj International Airport',
    DEL: 'New Delhi - Indira Gandhi International Airport',
    KTM: 'Kathmandu - Tribhuvan International Airport',
    BJS: 'Beijing - Beijing Capital International Airport',
    PEK: 'Beijing - Beijing Capital International Airport',
    HKG: 'Hong Kong - Hong Kong International Airport',
    NRT: 'Tokyo - Narita International Airport',
    ICN: 'Seoul - Incheon International Airport',
    SYD: 'Sydney - Sydney Kingsford Smith Airport',
    JFK: 'New York - John F. Kennedy International Airport',
    IAD: 'Washington - Dulles International Airport',
    CDG: 'Paris - Charles de Gaulle Airport',
    FCO: 'Rome - Leonardo da Vinci International Airport',
    FRA: 'Frankfurt - Frankfurt Airport',
    AMS: 'Amsterdam - Schiphol Airport',
    MAN: 'Manchester - Manchester Airport',
    JNB: 'Johannesburg - O.R. Tambo International Airport',
    CAI: 'Cairo - Cairo International Airport',
    BOS: 'Boston - Logan International Airport',
  };

  const airportName = (code: string) =>
    airports[code] || `${code} Airport`;

  const money = new Intl.NumberFormat('en-PK', {
    maximumFractionDigits: 0,
  });

  const date = (value: any) =>
    value
      ? new Date(value).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
      : 'N/A';

  const time = (value: any) =>
    value
      ? new Date(value).toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
        })
      : '--:--';

  const passengerName = (passenger: any) =>
    [
      passenger?.firstName,
      passenger?.lastName,
    ]
      .filter(Boolean)
      .join(' ') ||
    passenger?.name ||
    'Passenger';

  const drawLabel = (
    label: string,
    value: string,
    x: number,
    y: number,
    width: number
  ) => {
    doc
      .fillColor(muted)
      .fontSize(8)
      .font('Helvetica-Bold')
      .text(label.toUpperCase(), x, y, {
        width,
      });

    doc
      .fillColor(navy)
      .fontSize(13)
      .font('Helvetica-Bold')
      .text(value, x, y + 13, {
        width,
      });
  };

  const drawRule = (y: number) => {
    doc
      .strokeColor(line)
      .lineWidth(1)
      .moveTo(42, y)
      .lineTo(553, y)
      .stroke();
  };

  tickets.forEach(
    (ticket: any, idx: number) => {
      if (idx > 0) {
        doc.addPage();
      }

      // Background
      doc
        .rect(0, 0, 595, 842)
        .fill('#f6f8fa');

      // Header
      doc
        .rect(0, 0, 595, 108)
        .fill(navy);

      doc
        .fillColor(gold)
        .font('Helvetica-Bold')
        .fontSize(22)
        .text('SKYPAKISTAN', 42, 32);

      doc
        .fillColor('#ffffff')
        .font('Helvetica')
        .fontSize(9)
        .text(
          'AIRWAYS  |  ELECTRONIC PASSENGER TICKET',
          43,
          64
        );

      doc
        .fillColor(gold)
        .font('Helvetica-Bold')
        .fontSize(10)
        .text('CONFIRMED', 470, 42, {
          width: 82,
          align: 'right',
        });

      doc
        .fillColor('#ffffff')
        .font('Helvetica')
        .fontSize(8)
        .text(
          'Issued  ' + date(new Date()),
          430,
          62,
          {
            width: 122,
            align: 'right',
          }
        );

      // Flight itinerary
      doc
        .roundedRect(32, 128, 531, 151, 6)
        .fill('#ffffff');

      doc
        .fillColor(muted)
        .font('Helvetica-Bold')
        .fontSize(9)
        .text(
          'FLIGHT ITINERARY',
          52,
          148
        );

      doc
        .fillColor(navy)
        .font('Helvetica-Bold')
        .fontSize(25)
        .text(
          flight.origin || '---',
          52,
          171
        );

      doc
        .fillColor(muted)
        .font('Helvetica')
        .fontSize(9)
        .text('ORIGIN', 53, 201);

      doc
        .fillColor(muted)
        .font('Helvetica')
        .fontSize(8.5)
        .text(
          airportName(
            flight.origin || '---'
          ),
          52,
          213,
          {
            width: 180,
          }
        );

      doc
        .fillColor(navy)
        .font('Helvetica-Bold')
        .fontSize(25)
        .text(
          flight.destination || '---',
          310,
          171
        );

      doc
        .fillColor(muted)
        .font('Helvetica')
        .fontSize(9)
        .text(
          'DESTINATION',
          311,
          201
        );

      doc
        .fillColor(muted)
        .font('Helvetica')
        .fontSize(8.5)
        .text(
          airportName(
            flight.destination || '---'
          ),
          310,
          213,
          {
            width: 205,
          }
        );

      doc
        .strokeColor(gold)
        .lineWidth(2)
        .moveTo(145, 186)
        .lineTo(278, 186)
        .stroke();

      doc
        .fillColor(gold)
        .fontSize(16)
        .text('>', 207, 176);

      doc
        .fillColor(muted)
        .font('Helvetica')
        .fontSize(9)
        .text(
          `${flight.flightNumber || 'SKP'}  |  ${
            flight.aircraft?.model || 'Aircraft'
          }`,
          151,
          208,
          {
            width: 125,
            align: 'center',
          }
        );

      doc
        .fillColor(navy)
        .font('Helvetica-Bold')
        .fontSize(11)
        .text(
          date(flight.departure),
          52,
          239
        );

      doc.text(
        time(flight.departure),
        52,
        255
      );

      doc
        .text(
          date(flight.arrival),
          310,
          239
        );

      doc.text(
        time(flight.arrival),
        310,
        255
      );

      // Passenger & booking
      doc
        .roundedRect(32, 298, 531, 143, 6)
        .fill('#ffffff');

      doc
        .fillColor(navy)
        .font('Helvetica-Bold')
        .fontSize(13)
        .text(
          'PASSENGER & BOOKING',
          52,
          320
        );

      drawRule(342);

      drawLabel(
        'Passenger',
        passengerName(
          ticket.passenger
        ),
        52,
        357,
        205
      );

      drawLabel(
        'Seat',
        ticket.seat ||
          booking.seats?.[idx] ||
          'Assigned at airport',
        285,
        357,
        90
      );

      drawLabel(
        'Cabin',
        ticket.passenger?.cabin ||
          'Economy',
        410,
        357,
        105
      );

      drawLabel(
        'PNR',
        booking.pnr || 'N/A',
        52,
        401,
        120
      );

      drawLabel(
        'Ticket number',
        ticket.ticketNumber,
        205,
        401,
        210
      );

      drawLabel(
        'Booking ID',
        booking.bookingId || 'N/A',
        430,
        401,
        85
      );

      doc
        .fillColor(muted)
        .font('Helvetica-Bold')
        .fontSize(8)
        .text(
          'CUSTOMER EMAIL',
          52,
          431
        );

      doc
        .fillColor(navy)
        .font('Helvetica-Bold')
        .fontSize(10)
        .text(
          customerEmail,
          145,
          429,
          {
            width: 370,
          }
        );

      // Travel document
      doc
        .roundedRect(32, 460, 531, 172, 6)
        .fill('#ffffff');

      doc
        .fillColor(navy)
        .font('Helvetica-Bold')
        .fontSize(13)
        .text(
          'TRAVEL DOCUMENT',
          52,
          482
        );

      doc
        .fillColor(muted)
        .font('Helvetica')
        .fontSize(9)
        .text(
          'Present this document together with your valid passport or identity document.',
          52,
          504
        );

      if (qrBuffers[idx]) {
        try {
          doc.image(
            qrBuffers[idx],
            52,
            528,
            {
              width: 92,
              height: 92,
            }
          );
        } catch (e) {
          console.error(
            'QR rendering failed:',
            e
          );
        }
      }

      if (barcodeBuffers[idx]) {
        try {
          doc.image(
            barcodeBuffers[idx],
            180,
            540,
            {
              width: 300,
              height: 58,
            }
          );
        } catch (e) {
          console.error(
            'Barcode rendering failed:',
            e
          );
        }
      }

      doc
        .fillColor(muted)
        .font('Helvetica')
        .fontSize(8)
        .text(
          'SCAN AT CHECK-IN',
          52,
          625
        );

      doc
        .text(
          'BOARDING PASS WILL BE ISSUED AFTER CHECK-IN',
          180,
          614,
          {
            width: 300,
            align: 'center',
          }
        );

      // Important information
      doc
        .roundedRect(32, 650, 531, 90, 6)
        .fill(navy);

      doc
        .fillColor(gold)
        .font('Helvetica-Bold')
        .fontSize(10)
        .text(
          'IMPORTANT TRAVEL INFORMATION',
          52,
          670
        );

      doc
        .fillColor('#ffffff')
        .font('Helvetica')
        .fontSize(8.5)
        .text(
          'Please arrive at the airport at least 3 hours before international departure.',
          52,
          690
        );

      doc.text(
        'Check baggage, visa and passport requirements before travelling. This ticket is non-transferable.',
        52,
        706
      );

      doc
        .fillColor(muted)
        .fontSize(8)
        .text(
          'SkyPakistan Airways  |  care@skypakistan.test  |  skypakistan.test',
          42,
          776,
          {
            align: 'center',
            width: 511,
          }
        );

      doc
        .fillColor(muted)
        .fontSize(8)
        .text(
          `Document ${idx + 1} of ${
            tickets.length
          }  |  Total booking value: PKR ${money.format(
            booking.totalPrice || 0
          )}`,
          42,
          792,
          {
            align: 'center',
            width: 511,
          }
        );
    }
  );
}

export const generateTickets = async (
  req: Request,
  res: Response
) => {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({
        message: 'bookingId required',
      });
    }

    const booking = await Booking.findOne({
      bookingId,
    })
      .populate('flight')
      .populate('user');

    if (!booking) {
      return res.status(404).json({
        message: 'Booking not found',
      });
    }

    if (booking.status !== 'CONFIRMED') {
      return res.status(400).json({
        message: 'Booking not confirmed',
      });
    }

    const tickets: any[] = [];
    const qrBuffers: Buffer[] = [];
    const barcodeBuffers: Buffer[] = [];

    for (
      let i = 0;
      i < booking.passengers.length;
      i++
    ) {
      const passenger =
        booking.passengers[i];

      // Generate unique ticket number
      const ticketNumber = `SKY-${randomUUID()
        .replace(/-/g, '')
        .slice(0, 12)
        .toUpperCase()}`;

      const ticket = new Ticket({
        booking: booking._id,
        ticketNumber,
        passenger,
      });

      await ticket.save();

      tickets.push({
        ticketNumber,
        passenger,
        seat: booking.seats[i],
      });

      // Generate QR
      const qr = await QRCode.toBuffer(
        JSON.stringify({
          ticketNumber,
          bookingId:
            booking.bookingId,
        })
      );

      qrBuffers.push(qr);

      // Generate barcode
      const barcode =
        await bwipjs.toBuffer({
          bcid: 'code128',
          text: ticketNumber,
          scale: 3,
          height: 10,
          includetext: true,
        });

      barcodeBuffers.push(barcode);
    }

    // Generate one PDF page for each ticket
    const doc = new PDFDocument({
      size: 'A4',
      margin: 0,
    });

    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });

    doc.on('end', async () => {
      try {
        const pdf = Buffer.concat(chunks);

        // Email
        const toEmail =
          (req.body.email as string) ||
          (booking.user &&
            (booking.user as any).email);

        if (toEmail) {
          try {
            await sendMail({
              to: toEmail,
              subject: `Your e-ticket ${booking.bookingId}`,
              text: `Attached is your ticket PNR ${booking.pnr}`,
              attachments: [
                {
                  filename: `ticket-${booking.bookingId}.pdf`,
                  content: pdf,
                },
              ],
            });
          } catch (e) {
            console.error(
              'Failed to send email:',
              e
            );
          }
        }

        // Audit
        try {
          const { recordAudit } =
            await import(
              '../services/audit.service'
            );

          await recordAudit({
            user: (req as any).user?.id,
            action: 'TICKETS_ISSUED',
            resource:
              booking.bookingId,
            details: {
              count: tickets.length,
            },
            ip: req.ip,
          });
        } catch (e) {
          console.error(
            'Audit failed:',
            e
          );
        }

        res.setHeader(
          'Content-Type',
          'application/pdf'
        );

        res.setHeader(
          'Content-Disposition',
          `attachment; filename="ticket-${booking.bookingId}.pdf"`
        );

        return res.send(pdf);
      } catch (error) {
        console.error(
          'PDF processing failed:',
          error
        );

        return res.status(500).json({
          message:
            'Failed to process ticket PDF',
        });
      }
    });

    writeTicketPDF(
      doc,
      booking,
      tickets,
      qrBuffers,
      barcodeBuffers
    );

    doc.end();
  } catch (err) {
    console.error(
      'Ticket generation error:',
      err
    );

    return res.status(500).json({
      message:
        'Failed to generate tickets',
    });
  }
}; 