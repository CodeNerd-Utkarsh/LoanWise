
# LoanWise - Smart EMI Calculator

**Version:** 1.0.0

**Author:** [Your Name/Team Name Here]

**Date:** [Current Date]

---

## Table of Contents

1.  [Introduction](#1-introduction)
    *   [Project Goal](#project-goal)
    *   [Target Audience](#target-audience)
2.  [Core Features](#2-core-features)
    *   [Dynamic EMI Calculation](#dynamic-emi-calculation)
    *   [Interactive Amortization Schedule](#interactive-amortization-schedule)
    *   [Multi-Currency Support](#multi-currency-support)
    *   [Adaptive Theme Toggle](#adaptive-theme-toggle)
    *   [Responsive Design](#responsive-design)
3.  [Technical Architecture & Design Decisions](#3-technical-architecture--design-decisions)
    *   [Framework: Next.js 15 (App Router)](#framework-nextjs-15-app-router)
    *   [Language: TypeScript](#language-typescript)
    *   [UI Components: ShadCN/UI](#ui-components-shadcnui)
    *   [Styling: Tailwind CSS & CSS Variables](#styling-tailwind-css--css-variables)
    *   [State Management: React Hooks](#state-management-react-hooks)
    *   [API Integration: ExchangeRate-API](#api-integration-exchangerate-api)
    *   [Code Quality & Maintainability](#code-quality--maintainability)
4.  [Component Breakdown](#4-component-breakdown)
    *   [`src/app/page.tsx`](#srcapppagetsx)
    *   [`src/components/emi-calculator-form.tsx`](#srccomponentsemi-calculator-formtsx)
    *   [`src/components/amortization-table.tsx`](#srccomponentsamortization-tabletsx)
    *   [`src/components/header.tsx`](#srccomponentsheadertsx)
    *   [`src/components/theme-toggle.tsx`](#srccomponentstheme-toggletsx)
    *   [`src/lib/emi-calculator.ts`](#srclibemi-calculatorts)
    *   [`src/lib/currency-utils.ts`](#srclibcurrency-utilsts)
5.  [Getting Started](#5-getting-started)
    *   [Prerequisites](#prerequisites)
    *   [Installation](#installation)
    *   [Environment Variables](#environment-variables)
    *   [Running the Development Server](#running-the-development-server)
    *   [Building for Production](#building-for-production)
6.  [API Key Management](#6-api-key-management)
7.  [Future Enhancements](#7-future-enhancements)
8.  [Conclusion](#8-conclusion)

---

## 1. Introduction

LoanWise is a modern, user-friendly web application designed to simplify loan calculations. It provides users with a clear and accurate Equated Monthly Installment (EMI) based on their loan parameters and displays a detailed amortization schedule. A key feature is its ability to perform calculations and display results in multiple currencies, leveraging real-time exchange rates.

### Project Goal

The primary goal of LoanWise is to offer a seamless, intuitive, and accurate tool for individuals planning loans or managing existing ones. It aims to demystify loan repayment schedules by providing transparent breakdowns of principal and interest payments over the loan's tenure, enhanced by multi-currency flexibility and a polished user interface.

### Target Audience

This application is intended for:
*   Potential borrowers comparing loan options.
*   Existing borrowers tracking their repayment progress.
*   Financial advisors assisting clients.
*   Anyone needing quick and reliable EMI calculations with currency conversion.

---

## 2. Core Features

LoanWise is built with several key features to ensure a robust and pleasant user experience:

### Dynamic EMI Calculation

*   Users can input the loan principal, annual interest rate, and loan duration in years.
*   The application instantly calculates the EMI using the standard formula.
*   Inputs are validated in real-time using Zod schema validation, providing immediate feedback.
*   Sliders and direct input fields offer flexible ways to adjust loan parameters.

### Interactive Amortization Schedule

*   Generates a month-by-month breakdown of each payment.
*   Clearly shows the principal and interest components of each EMI.
*   Displays the remaining loan balance after each payment.
*   Presented in a scrollable, easy-to-read table (`shadcn/ui Table` and `ScrollArea`).

### Multi-Currency Support

*   Allows users to select their preferred currency from a dropdown list (USD, EUR, GBP, INR, JPY, etc.).
*   Fetches real-time exchange rates from the [ExchangeRate-API.com](https://www.exchangerate-api.com/) service.
*   Displays the loan amount, EMI, and amortization schedule figures in the selected currency.
*   Handles API errors gracefully and informs the user if rates are unavailable.
*   Calculations are performed in a base currency (USD) and then converted for display, ensuring accuracy.

### Adaptive Theme Toggle

*   Includes a theme switcher (Light/Dark/System) powered by `next-themes`.
*   Provides optimal viewing comfort in different lighting conditions.
*   Theme settings persist across sessions.

### Responsive Design

*   The application is fully responsive, adapting gracefully to various screen sizes (desktop, tablet, mobile).
*   Leverages Tailwind CSS utility classes for responsive layouts.

---

## 3. Technical Architecture & Design Decisions

The technical stack and design choices were made to prioritize performance, developer experience, maintainability, and user experience.

### Framework: Next.js 15 (App Router)

*   **Reasoning:** The Next.js App Router was chosen for its improved performance characteristics, server-centric approach, and built-in features like optimized routing, Server Components, and Server Actions (though Server Actions are not yet used in this iteration).
*   **Benefits:** Faster page loads, reduced client-side JavaScript bundle size (by default using Server Components where possible, although the current main page is client-rendered due to interactivity), simplified data fetching patterns, and a clear project structure.

### Language: TypeScript

*   **Reasoning:** TypeScript enhances code quality and maintainability by adding static typing to JavaScript.
*   **Benefits:** Early error detection during development, improved code readability and autocompletion, better collaboration in teams, and more robust code.

### UI Components: ShadCN/UI

*   **Reasoning:** ShadCN/UI provides a collection of beautifully designed, accessible, and customizable UI components built on Radix UI and styled with Tailwind CSS. It's not a traditional component library; instead, you copy/paste component code into your project, allowing full control.
*   **Benefits:** High-quality, accessible components out-of-the-box, consistent styling aligned with the project's design system, full ownership and customization of component code, and excellent integration with Tailwind CSS. Components like `Card`, `Table`, `Input`, `Slider`, `Select`, `Button`, `Toast`, and `ScrollArea` are used extensively.

### Styling: Tailwind CSS & CSS Variables

*   **Reasoning:** Tailwind CSS is a utility-first CSS framework that enables rapid UI development directly within the markup. CSS variables (defined in `globals.css`) are used for theming (light/dark modes) and maintaining a consistent color palette based on the project's style guidelines (Blue primary, Gray secondary, Green accent).
*   **Benefits:** Faster development, highly customizable UIs, easy maintenance of styling logic, consistent design system, and seamless integration with ShadCN/UI and `next-themes` for light/dark mode support.

### State Management: React Hooks

*   **Reasoning:** For the current scope of the application, React's built-in hooks (`useState`, `useEffect`, `useCallback`, `useMemo`) provide sufficient state management capabilities. The primary state (form data, EMI, schedule, currency, rates) is managed within the main page component (`src/app/page.tsx`).
*   **Benefits:** Simplicity, less boilerplate compared to external state management libraries, leverages core React features, and sufficient for managing local component and page-level state. `useCallback` and `useMemo` are used to optimize performance by memoizing functions and values.

### API Integration: ExchangeRate-API

*   **Reasoning:** A reliable source for real-time currency exchange rates was needed for the multi-currency feature. ExchangeRate-API.com offers a straightforward REST API.
*   **Implementation:** A `fetch` call is made within a `useEffect` hook on the client-side to retrieve the latest USD-based rates. Error handling is implemented to manage API key issues or network failures. The API key is stored securely as an environment variable.
*   **Optimization:** The API call is made only once on page load to minimize costs and requests. Rates are then stored in state for use throughout the user session.

### Code Quality & Maintainability

*   **Modularity:** Code is organized into reusable components (`emi-calculator-form`, `amortization-table`) and utility functions (`emi-calculator`, `currency-utils`).
*   **Readability:** Clear variable names, consistent formatting (enforced by Prettier/ESLint, typically), and adherence to React best practices.
*   **Type Safety:** TypeScript ensures type safety throughout the application.
*   **Error Handling:** Specific error handling for API calls and calculations is implemented, providing feedback to the user via Alerts and Toasts.

---

## 4. Component Breakdown

### `src/app/page.tsx`

*   **Role:** The main entry point and container component for the application.
*   **Responsibilities:**
    *   Manages the core application state (EMI, schedule, form data, selected currency, exchange rates, loading/error states).
    *   Handles the initial fetching of exchange rates using `useEffect` and `fetch`.
    *   Orchestrates the calculation logic by calling utility functions.
    *   Renders the `EmiCalculatorForm` and `AmortizationTable` components, passing necessary props and callbacks.
    *   Displays loading indicators and error messages related to API calls.
    *   Performs the initial calculation using default values once rates are loaded.

### `src/components/emi-calculator-form.tsx`

*   **Role:** Renders the user input form for loan parameters and displays the calculated EMI.
*   **Responsibilities:**
    *   Uses `react-hook-form` for efficient form handling and validation (with `zod` resolver).
    *   Renders input fields (`Input`, `Slider`) for principal, rate, and duration.
    *   Includes a `Select` component for currency selection.
    *   Displays the principal amount dynamically formatted in the selected currency.
    *   Calculates and displays the resulting EMI in the selected currency in the `CardFooter`.
    *   Handles currency conversion for input display and validation limits.
    *   Provides real-time validation feedback (`FormMessage`).
    *   Calls the `onCalculate` callback prop when the form is submitted successfully.
    *   Uses `useToast` to show success/error messages.

### `src/components/amortization-table.tsx`

*   **Role:** Displays the detailed loan amortization schedule.
*   **Responsibilities:**
    *   Receives the `schedule` data, `selectedCurrency`, and `exchangeRates` as props.
    *   Renders the schedule data in a `Table` component.
    *   Uses `ScrollArea` to handle potentially long schedules.
    *   Formats all monetary values in the table according to the `selectedCurrency` using `currency-utils`.
    *   Displays a message if the schedule data is not yet available.
    *   Shows an informational note if exchange rates for the selected currency are unavailable.

### `src/components/header.tsx`

*   **Role:** Provides the main application header/navigation bar.
*   **Responsibilities:**
    *   Displays the application title ("LoanWise") and logo (`Calculator` icon).
    *   Includes the `ThemeToggle` component.
    *   Uses a sticky position for easy access.

### `src/components/theme-toggle.tsx`

*   **Role:** Allows users to switch between light, dark, and system themes.
*   **Responsibilities:**
    *   Uses the `useTheme` hook from `next-themes`.
    *   Renders a `DropdownMenu` with theme options.
    *   Displays appropriate icons (Sun/Moon) based on the current theme.
    *   Handles client-side mounting to avoid hydration errors.

### `src/lib/emi-calculator.ts`

*   **Role:** Contains the core business logic for EMI and amortization calculations.
*   **Responsibilities:**
    *   Exports `calculateEMI` function: Takes principal, annual rate, and duration (months) and returns the monthly EMI. Includes edge case handling (e.g., zero interest rate) and validation.
    *   Exports `generateAmortizationSchedule` function: Calculates the full schedule based on loan parameters and the calculated EMI. Returns an array of `AmortizationEntry` objects. Includes logic for accurate final payment calculation.
    *   Exports the `AmortizationEntry` type definition.

### `src/lib/currency-utils.ts`

*   **Role:** Provides utility functions for currency conversion and formatting.
*   **Responsibilities:**
    *   Exports `convertCurrencyValue`: Converts an amount from the base currency (USD) to a target currency using the provided rates.
    *   Exports `formatCurrency`: Formats a number as a currency string using `toLocaleString`.
    *   Exports `convertAndFormatCurrency`: Combines conversion and formatting into a single step.
    *   Exports `supportedCurrencies`: An array defining the currencies available in the dropdown.
    *   Handles cases where rates might be missing or invalid.

---

## 5. Getting Started

Follow these steps to set up and run the LoanWise application locally.

### Prerequisites

*   Node.js (Version 18.x or later recommended)
*   npm or yarn or pnpm

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```

### Environment Variables

The application requires an API key from [ExchangeRate-API.com](https://www.exchangerate-api.com/) to fetch currency rates.

1.  Sign up for a free API key at [ExchangeRate-API.com](https://www.exchangerate-api.com/).
2.  Create a `.env.local` file in the root of the project directory.
3.  Add your API key to the `.env.local` file:

    ```env
    NEXT_PUBLIC_EXCHANGE_RATE_API_KEY=YOUR_API_KEY_HERE
    ```

    *Note:* Using `NEXT_PUBLIC_` prefix makes the variable accessible in the browser. Be mindful that this key will be exposed in the client-side bundle. For production applications with sensitive keys or higher rate limits, consider using a backend proxy or Next.js API route to hide the key.

### Running the Development Server

Start the Next.js development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:9002](http://localhost:9002) (or the specified port) in your browser to view the application. The app will automatically reload when you make changes to the code.

### Building for Production

To create an optimized production build:

```bash
npm run build
# or
yarn build
# or
pnpm build
```

To run the production build locally:

```bash
npm run start
# or
yarn start
# or
pnpm start
```

---

## 6. API Key Management

*   The current implementation uses a client-side accessible environment variable (`NEXT_PUBLIC_EXCHANGE_RATE_API_KEY`) for the ExchangeRate-API key.
*   **Security Consideration:** For production environments or scenarios requiring stricter key protection, it's recommended to implement a backend proxy. This could be a simple Next.js API Route (`src/app/api/rates/route.ts`) that fetches the rates server-side using a non-public environment variable and then exposes the rates (not the key) to the client. This prevents the API key from being exposed in the browser's source code.
*   **Cost Optimization:** The API is called only once when the main page component mounts. The rates are then stored in React state. This minimizes API usage, which is crucial for free or limited-usage plans. No further calls are made unless the page is reloaded.

---

## 7. Future Enhancements

*   **Loan Comparison:** Allow users to compare multiple loan scenarios side-by-side.
*   **Visualizations:** Add charts (e.g., using `recharts` via ShadCN Charts) to visualize the principal vs. interest breakdown over time.
*   **Advanced Options:** Include options for pre-payment calculations, variable interest rates, or additional fees.
*   **Saving/Loading Scenarios:** Allow users to save their loan calculations locally (using `localStorage`) or potentially through user accounts.
*   **API Key Proxy:** Implement a Next.js API route to proxy the ExchangeRate-API calls, hiding the API key from the client-side.
*   **Internationalization (i18n):** Add support for multiple languages in the UI.
*   **Progressive Web App (PWA):** Add offline capabilities and installability.
*   **GenAI Features (Optional):** Integrate Genkit for potential features like personalized loan advice based on inputs (requires careful prompt engineering and handling of financial advice disclaimers).

---

## 8. Conclusion

LoanWise demonstrates the effective use of modern web technologies like Next.js, TypeScript, ShadCN/UI, and Tailwind CSS to build a practical and user-friendly financial tool. Its core strengths lie in its accurate calculations, clear presentation of data, multi-currency support via API integration, and polished user interface with theming. The project follows best practices for structure, state management, and component design, making it a solid foundation for future development and a good example of building functional React applications. The careful consideration of API usage ensures efficiency and cost-effectiveness.
