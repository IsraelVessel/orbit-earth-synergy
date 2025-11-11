import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MilestoneNotificationRequest {
  email: string;
  userName: string;
  businessModel: string;
  milestone: string;
  currentValue: number;
  thresholdValue: number;
  metricType: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      email, 
      userName, 
      businessModel, 
      milestone, 
      currentValue, 
      thresholdValue,
      metricType 
    }: MilestoneNotificationRequest = await req.json();

    console.log(`Sending milestone notification to ${email} for ${businessModel}`);

    const emailResponse = await resend.emails.send({
      from: "LEO Commerce Simulator <onboarding@resend.dev>",
      to: [email],
      subject: `🎉 Milestone Achieved: ${milestone}!`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px;
                border-radius: 10px 10px 0 0;
                text-align: center;
              }
              .content {
                background: #f8f9fa;
                padding: 30px;
                border-radius: 0 0 10px 10px;
              }
              .milestone-badge {
                background: #10b981;
                color: white;
                padding: 10px 20px;
                border-radius: 25px;
                display: inline-block;
                margin: 20px 0;
                font-weight: bold;
              }
              .metrics {
                background: white;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
                border-left: 4px solid #667eea;
              }
              .metric-row {
                display: flex;
                justify-content: space-between;
                margin: 10px 0;
                padding: 10px 0;
                border-bottom: 1px solid #e5e7eb;
              }
              .metric-label {
                color: #6b7280;
                font-weight: 500;
              }
              .metric-value {
                color: #111827;
                font-weight: bold;
                font-size: 1.1em;
              }
              .footer {
                text-align: center;
                color: #6b7280;
                margin-top: 30px;
                font-size: 0.9em;
              }
              .cta-button {
                background: #667eea;
                color: white;
                padding: 12px 30px;
                border-radius: 6px;
                text-decoration: none;
                display: inline-block;
                margin: 20px 0;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>🚀 Congratulations ${userName}!</h1>
              <p>Your simulation has reached a significant milestone</p>
            </div>
            <div class="content">
              <div class="milestone-badge">${milestone}</div>
              
              <h2>Simulation Details</h2>
              <div class="metrics">
                <div class="metric-row">
                  <span class="metric-label">Business Model:</span>
                  <span class="metric-value">${businessModel}</span>
                </div>
                <div class="metric-row">
                  <span class="metric-label">${metricType}:</span>
                  <span class="metric-value">${currentValue}${metricType === 'ROI' ? '%' : ''}</span>
                </div>
                <div class="metric-row">
                  <span class="metric-label">Target Threshold:</span>
                  <span class="metric-value">${thresholdValue}${metricType === 'ROI' ? '%' : ''}</span>
                </div>
              </div>

              <p>Your <strong>${businessModel}</strong> simulation has successfully achieved the ${metricType} milestone!</p>
              
              <p>This is a significant achievement that demonstrates the strong potential of your business model. Keep exploring different parameters to optimize your results further.</p>

              <center>
                <a href="${Deno.env.get('VITE_SUPABASE_URL')?.replace('.supabase.co', '') || 'https://your-app.com'}" class="cta-button">
                  View Your Simulations
                </a>
              </center>

              <div class="footer">
                <p>This is an automated notification from LEO Commerce Simulator</p>
                <p>Keep simulating, keep innovating! 🌟</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-milestone-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
