# App Flow Document

## Onboarding and Sign-In/Sign-Up

When a customer sends a first message to the parapharmacy on WhatsApp, the chatbot Léa immediately replies with a welcome message that mentions the brand identity and tone. The chatbot asks for explicit consent to process personal data and stores this consent with a timestamp in the Supabase database. If the customer agrees, the conversation proceeds; if the customer declines or sends the keyword for deletion, their data is erased according to GDPR rules and a confirmation message is sent.

For administrators and support agents, the web dashboard has its own sign-up and sign-in flow. The agent visits the dashboard URL and is presented with an email and password form. New users can create an account by entering their name, email, and password, and then confirming their email via a link sent by Supabase Auth. Password recovery is available by clicking a link on the sign-in page, entering the registered email, and following a time-limited reset link. Once signed in, users can sign out with a button in the header. Role-based access is assigned at account creation or by an administrator later in the settings.

## Main Dashboard or Home Page

After signing in, the user lands on the main dashboard. At the top, the company logo appears alongside a greeting and the current user’s name. A sidebar on the left lists the main sections: Products, Client Interactions, Reporting, GDPR Requests, and Settings. Each section displays an icon and label in the brand’s green and white palette. In the central area, key performance indicators are shown as cards: total conversations today, conversion rate, number of orders generated, and customer satisfaction score. A header bar shows notifications, user avatar, and a quick link to sign out. From this home page, clicking any sidebar item navigates to the corresponding section without reloading the whole page, thanks to Next.js routing.

## Detailed Feature Flows and Page Transitions

The Products section opens a list of all items stored in Supabase. Each row shows the product name, category, price, stock level, and status. Above the list, a button labeled "Import CSV" takes the user to a page with a file upload form. On that page, the user selects a CSV file and clicks "Upload." The system validates the file format, shows any errors inline, and then processes the records to insert or update products in the database. If import succeeds, the user is redirected back to the product list and sees a success banner. If errors occur, the page displays details and allows correction.

Clicking "Add Product" opens a form page where the user fills in fields for name, description, category, price, stock quantity, image URL, ingredients, expiration date, brand, barcode, tags, and an activation toggle. Upon saving, the page validates inputs, shows inline errors if needed, and then stores the product in Supabase before navigating back to the list.

In the Client Interactions section, the user sees live and historical WhatsApp conversations. Each conversation entry shows the customer name, start date, current status, and a badge if it was escalated to a human advisor. Clicking a conversation opens a detail view where the admin can read the chat history, send manual messages via the Whapi API, and view metadata such as identified needs, recommended products, and consent status. A button in that view allows exporting the chat log as a PDF.

The Recommendation flow begins automatically when the chatbot Léa asks the customer for the type of need. Based on predefined decision trees and GPT-4o analysis, the bot refines the request with questions about brand preference or product attributes. Once the customer answers, the bot generates a product selection and sends messages with images, prices, availability, and a link to the external e-commerce site. If the customer’s basket value is high or they use a keyword like “advisor,” an alert is sent by email and displayed on the dashboard. Human agents see incoming alerts in the Notifications area and can click to join the conversation.

After the customer clicks the external cart link and completes payment on the e-commerce platform, the chatbot receives a payment confirmation webhook. It then sends an order confirmation message on WhatsApp with a tracking number. Supabase records the transaction details and updates the customer’s profile with purchase history and satisfaction timestamp.

In the Reporting section, the user sees charts and tables for total conversations, conversion rate, sales volume via WhatsApp, recommended product performance, and response rates for reactivation messages. Date filters at the top let users adjust the time range, with results updating instantly.

## Settings and Account Management

The Settings section includes personal account settings, company profile settings, and role management. In personal settings, the user can update their name, email, and password. They can also configure email notification preferences for alerts and daily summary reports. Company profile settings allow uploading the logo, defining primary and secondary brand colors, and adjusting the editorial tone used by the chatbot.

A dedicated Role Management page lists all users and their roles. Administrators can change roles, add new users, or deactivate accounts. The GDPR Requests page lets admins view all consent logs and deletion requests. Clicking a request shows details and allows manual override or confirmation. After any settings change, the user clicks "Save" and the system validates inputs, shows errors if needed, and applies updates in Supabase.

## Error States and Alternate Paths

If the customer sends malformed input on WhatsApp or selects an unsupported option, the chatbot replies with an apology and a simplified menu to restart the flow. If Supabase or the Whapi API is unreachable, the system sends an error message notifying the customer of a temporary issue and logs the error for the admin. On the dashboard, if an API call fails, a banner appears explaining the problem and suggesting the user try again. CSV import errors show row-level feedback so the user can correct data and reupload.

If the admin’s session expires or the network connection is lost, the dashboard shows a sign-in prompt and preserves unsaved form data briefly so the user can log in again without losing their progress. Any invalid field entries trigger inline error messages explaining exactly what needs to be fixed.

## Conclusion and Overall App Journey

A customer journey begins when they message the parapharmacy on WhatsApp and provide consent. Léa greets them, identifies their needs through targeted questions, and generates personalized product recommendations powered by GPT-4o. If required, the customer is seamlessly handed off to a human advisor. The purchase is finalized via a link to the existing e-commerce site and payment is confirmed back in the chat. Post-purchase, the chatbot sends satisfaction surveys and loyalty offers on a schedule. On the other side, administrators use the Next.js dashboard to manage product data, monitor conversations, track performance metrics in real time, handle GDPR requests, and adjust settings. This integrated flow ensures customers receive timely, personalized assistance while the team maintains full control over content, compliance, and analytics.