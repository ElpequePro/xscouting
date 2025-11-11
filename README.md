# ⚽ XScouting - Football Scouting Platform

![XScouting Banner](https://img.shields.io/badge/Next.js-16.0.0-black?style=for-the-badge&logo=next.js) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript) ![Supabase](https://img.shields.io/badge/Supabase-2.76.1-green?style=for-the-badge&logo=supabase) ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=for-the-badge&logo=tailwind-css)

XScouting is an interactive web platform for football scouting, designed for coaches, scouts, and fans. It allows creating custom tactics, visualizing player statistics, exploring teams, and simulating transfer markets, all in a modern and user-friendly interface.

## 🌟 Key Features

### 🏗️ Tactics Creator
- Interactive tool to design football formations.
- Creation of tactics with custom players (fantasy or user-defined profiles).
- Real-time visualization of tactics.

### 👤 Player Visualization
- Complete player details: statistics, positions, attributes.
- Interactive sections to explore player profiles.
- Advanced search and filtering by position, age, club, stats, etc.

### 🏆 Teams and National Teams
- Browsable interfaces to view clubs, national teams, and their squads.
- Dedicated section for young prospects with specialized filters.

### 📊 Statistics and Analysis
- Charts and visualizations for player, team, and match statistics.
- Side-by-side comparison tools.
- Basic performance reports and team analytics.

### 💰 Transfer Market
- Simulation of buying/selling players.
- Bidding system and budget tracking.
- Team building with drag-and-drop.

### 🔐 Authentication and Personalization
- Login/registration to save tactics and favorites.
- Watchlists and tactic sharing.

## 🚀 Technologies Used

- **Frontend**: [Next.js](https://nextjs.org) with [React](https://reactjs.org) and [TypeScript](https://www.typescriptlang.org)
- **Styling**: [Tailwind CSS](https://tailwindcss.com) for modern and responsive design
- **Database**: [Supabase](https://supabase.com) for data management and authentication
- **Storage**: [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) for avatars and files
- **Cache**: [Upstash Redis](https://upstash.com) for performance optimization
- **Animations**: [Framer Motion](https://www.framer.com/motion) for smooth interactions
- **Forms**: [React Hook Form](https://react-hook-form.com) with [Zod](https://zod.dev) for validation
- **Drag & Drop**: [React DnD](https://react-dnd.github.io/react-dnd/about) for interactive interfaces
- **Icons**: [React Icons](https://react-icons.github.io/react-icons)
- **Analytics**: [Vercel Analytics](https://vercel.com/analytics) and [Speed Insights](https://vercel.com/speed-insights)

## 🛠️ Installation and Setup

### Prerequisites
- Node.js (version 18 or higher)
- npm, yarn, pnpm, or bun

### Getting Started

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/xscouting.git
   cd xscouting
   ```

2. **Install dependencies**:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   # or
   bun install
   ```

3. **Configure environment variables**:
   Create a `.env.local` file in the root of the project and add your Supabase keys and other necessary configurations.

4. **Run the development server**:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

5. **Open your browser**:
   Go to [http://localhost:3000](http://localhost:3000) to see the application.

## 🤝 Contributing

Contributions are welcome! If you want to contribute:

1. Fork the project
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -m 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Open a Pull Request

## 🗺️ Roadmap and Future Enhancements

XScouting aims to become the ultimate football scouting platform. Here's what's planned to unlock its full potential:

### 🚀 Short-Term Goals (Next 6-12 Months)
- **Real-Time Data Integration**: Connect to live football APIs (e.g., Football-Data.org, API-Football) for up-to-date player stats, match results, and transfer news.
- **AI-Powered Insights**: Implement basic AI algorithms for player potential predictions, tactic suggestions, and match outcome simulations.
- **Mobile App**: Develop a companion PWA or native app for on-the-go scouting.
- **Advanced Analytics**: Add heatmaps, player tracking visualizations, and predictive modeling for performance trends.

### 🌟 Long-Term Vision (1-2 Years)
- **Social Scouting Community**: Build forums, user-generated content, and collaborative tactic sharing with voting and comments.
- **VR/AR Tactics Viewer**: Integrate virtual reality for immersive 3D tactic visualization and training simulations.
- **Global Expansion**: Multi-language support, regional leagues, and partnerships with football federations.
- **Monetization and Premium Features**: Subscription tiers for advanced tools, exclusive data, and custom branding.
- **API Ecosystem**: Release a public API for third-party integrations, allowing developers to build custom scouting tools.

### 🤝 How to Contribute to the Vision
We welcome contributions that align with our roadmap! Check the [TODO.md](TODO.md) for detailed tasks, or propose new ideas via GitHub Issues. Let's build the future of football scouting together.

## 🤝 Contributing

Contributions are welcome! If you want to contribute:

1. Fork the project
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -m 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Open a Pull Request

*This project was developed with the assistance of AI tools.*

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for more details.

## 📞 Contact

If you have questions or suggestions, feel free to open an issue in this repository.

---

Enjoy scouting with XScouting! ⚽🔍
