import React from 'react';

const AboutPage = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-6 text-center">About Our Lottery App</h1>

      <section className="mb-10">
        <h2 className="text-3xl font-semibold mb-4">Our Mission</h2>
        <p className="text-lg leading-relaxed mb-4">
          Our mission is to provide a fun, secure, and transparent lottery experience for everyone.
          We aim to create millionaires while ensuring fair play and responsible gaming.
          We believe in making dreams come true, one ticket at a time.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-3xl font-semibold mb-4">How It Works</h2>
        <ul className="list-disc list-inside text-lg leading-relaxed space-y-2">
          <li><span className="font-semibold">Purchase Tickets:</span> Easily buy lottery tickets through our intuitive app interface.</li>
          <li><span className="font-semibold">Choose Your Numbers:</span> Select your lucky numbers manually or use our quick pick option.</li>
          <li><span className="font-semibold">Daily Draws:</span> Participate in daily draws for a chance to win big.</li>
          <li><span className="font-semibold">Secure Winnings:</span> Winnings are credited directly to your secure in-app wallet.</li>
          <li><span className="font-semibold">Responsible Gaming:</span> We promote responsible gaming with features and resources to help you play safely.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-3xl font-semibold mb-4">Our Commitment</h2>
        <p className="text-lg leading-relaxed mb-4">
          We are committed to maintaining the highest standards of security and fairness.
          Our platform uses advanced encryption to protect your data and transactions.
          All draws are conducted using certified random number generation to ensure impartiality.
        </p>
        <p className="text-lg leading-relaxed">
          Thank you for choosing our Lottery App. Good luck!
        </p>
      </section>
    </div>
  );
};

export default AboutPage;
