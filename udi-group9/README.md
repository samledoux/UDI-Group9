This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).





Commits done off bolgerru were off a cursor pro borrowed account to access more features for the project. 

rest of commits done off two seperate smaledoux accounts to acess free limited features.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [https://udi-group9.vercel.app](https://udi-group9.vercel.app) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

### Option 1: Deploy via Vercel CLI

1. Install the Vercel CLI globally:
   ```bash
   npm i -g vercel
   ```

2. Deploy your project:
   ```bash
   vercel
   ```

3. Follow the prompts to link your project to Vercel.

4. For production deployment:
   ```bash
   vercel --prod
   ```

### Option 2: Deploy via GitHub Integration

1. Push your code to a GitHub repository.

2. Go to [vercel.com/new](https://vercel.com/new) and sign in with your GitHub account.

3. Import your repository - Vercel will automatically detect it's a Next.js project.

4. Click "Deploy" - Vercel will automatically build and deploy your app.

5. Every push to your main branch will trigger automatic deployments.

### Post-Deployment Notes

- **In-Memory State**: This app uses in-memory state management (`busStore.ts`). State will reset on serverless function cold starts. For production use, consider implementing a database or persistent storage solution.

- **API Routes**: All API routes at `/api/buses/*` are automatically available on your Vercel deployment.

- **Environment Variables**: No environment variables are required for this deployment.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


command to change data for powershell (windows)

## Update Wheelchair Availability

You can update wheelchair availability for a specific bus using its ID, or for any bus on a route:

### Update by Bus ID (Recommended)

Update a specific bus by its unique ID:

```powershell
# Update bus E1-001
curl -Method POST https://udi-group9.vercel.app/api/buses/wheelchair -ContentType "application/json" -Body '{"id":"E1-001","wheelchair_available":true}'

# Update bus E2-003
curl -Method POST https://udi-group9.vercel.app/api/buses/wheelchair -ContentType "application/json" -Body '{"id":"E2-003","wheelchair_available":false}'
```

```

**Note:** 
- Bus IDs follow the pattern: `{ROUTE}-{NUMBER}` (e.g., `E1-001`, `E2-003`, `29A-005`)


## Update Seat Availability

There are two ways to update seat availability:

### Method 1: Set All Seats to Available/Unavailable

Set all seats on a bus to available or unavailable:

#### By Bus ID (Recommended)
```powershell
# Set all seats to available on bus E1-001
curl -Method POST https://udi-group9.vercel.app/api/buses/seats -ContentType "application/json" -Body '{"id":"E1-001","set_all_available":true}'

# Set all seats to unavailable on bus E2-003
curl -Method POST https://udi-group9.vercel.app/api/buses/seats -ContentType "application/json" -Body '{"id":"E2-003","set_all_available":false}'
```



### Method 2: Update Specific Seats

Update individual seats by providing their IDs:

#### By Bus ID 
```powershell
# Update specific seats on bus E1-001
curl -Method POST https://udi-group9.vercel.app/api/buses/seats -ContentType "application/json" -Body '{"id":"E1-001","seats":[{"id":"E1-001-SEAT-1","available":false},{"id":"E1-001-SEAT-2","available":true},{"id":"E1-001-SEAT-3","available":false}]}'
```



**Note:** 
- Bus IDs follow the pattern: `{ROUTE}-{NUMBER}` (e.g., `E1-001`, `E2-003`, `29A-005`)
- Seat IDs follow the pattern: `{BUS_ID}-SEAT-{SEAT_NUMBER}` (e.g., `E1-001-SEAT-1`, `E2-003-SEAT-15`, `29A-005-SEAT-20`)
- Using bus ID is recommended when you want to update a specific bus
- You can update multiple seats in a single request by including them all in the `seats` array
- The `destination` parameter is optional but recommended when multiple buses share the same route


example processing code to change wheelchair status:

import http.requests.*;

void setup() {
  size(400, 200);
  
  // Update these values
  String busId = "E1-001";
  boolean wheelchairAvailable = false;
  
  // Make the POST request
  updateWheelchairAvailability(busId, wheelchairAvailable);
}

void updateWheelchairAvailability(String busId, boolean available) {
  String url = "https://udi-group9.vercel.app/api/buses/wheelchair";
  
  // Create JSON body
  String jsonBody = "{\"id\":\"" + busId + "\",\"wheelchair_available\":" + available + "}";
  
  // Create POST request
  PostRequest post = new PostRequest(url);
  post.addHeader("Content-Type", "application/json");
  post.addData(jsonBody);
  
  // Send request
  post.send();
  
  // Print response
  println("Response: " + post.getContent());
  
  // Check if response contains success indicators
  String response = post.getContent();
  if (response.contains("\"ok\":true") || response.contains("bus")) {
    println("Success! Wheelchair availability updated.");
  } else {
    println("Check the response above for details.");
  }
}

//yo family 
