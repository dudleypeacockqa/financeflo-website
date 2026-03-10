import { useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, Clock, Mail } from "lucide-react";

const PRIMARY_BOOKING_URL =
  "https://book.vimcal.com/p/dudleypeacock/30-minute-meeting-f8337";
const EXTENDED_BOOKING_URL =
  "https://book.vimcal.com/p/dudleypeacock/60-minute-meeting-D158w";

export default function BookingERPConsultation() {
  useEffect(() => {
    document.title = "Book ERP Consultation | FinanceFlo.ai";
  }, []);

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container max-w-4xl mx-auto">
        <div
          className="glass-panel p-8 sm:p-10 text-center"
          style={{ borderRadius: "var(--radius-lg)" }}
        >
          <span className="text-xs font-mono text-teal uppercase tracking-widest">
            Strategy Call Booking
          </span>
          <h1
            className="text-3xl sm:text-4xl font-bold mt-3 mb-4"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Book Your ERP Consultation
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Choose the call length that matches your current decision stage.
            Use the 30-minute option for a focused assessment review, or the
            60-minute option when you want to explore delivery scope, timeline,
            and ROI in more detail.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 text-left">
            <div
              className="glass-panel p-6 border border-teal/30"
              style={{ borderRadius: "var(--radius)" }}
            >
              <div className="flex items-center gap-3 mb-3">
                <Calendar className="w-5 h-5 text-teal" />
                <h2
                  className="text-xl font-semibold"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  30-Minute Strategy Call
                </h2>
              </div>
              <p className="text-sm text-muted-foreground mb-5">
                Best for a first review of your assessment output, primary
                constraint, and next-step recommendation.
              </p>
              <a href={PRIMARY_BOOKING_URL} target="_blank" rel="noopener noreferrer">
                <Button className="w-full bg-amber text-navy-dark font-bold hover:bg-amber/90 gap-2">
                  <ArrowRight className="w-4 h-4" />
                  Open 30-Minute Booking
                </Button>
              </a>
            </div>

            <div
              className="glass-panel p-6 border border-border/40"
              style={{ borderRadius: "var(--radius)" }}
            >
              <div className="flex items-center gap-3 mb-3">
                <Clock className="w-5 h-5 text-teal" />
                <h2
                  className="text-xl font-semibold"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  60-Minute Working Session
                </h2>
              </div>
              <p className="text-sm text-muted-foreground mb-5">
                Use this when the commercial and implementation path needs a
                deeper working session with the decision team.
              </p>
              <a href={EXTENDED_BOOKING_URL} target="_blank" rel="noopener noreferrer">
                <Button className="w-full bg-teal text-navy-dark font-bold hover:bg-teal/90 gap-2">
                  <ArrowRight className="w-4 h-4" />
                  Open 60-Minute Booking
                </Button>
              </a>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/assessment">
              <Button variant="outline" className="border-teal/40 text-teal hover:bg-teal/10 gap-2">
                <ArrowRight className="w-4 h-4" />
                Return to Assessment
              </Button>
            </Link>
            <a href="mailto:dudley@financeflo.ai">
              <Button variant="outline" className="border-border/40 gap-2">
                <Mail className="w-4 h-4" />
                Email Dudley Directly
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
