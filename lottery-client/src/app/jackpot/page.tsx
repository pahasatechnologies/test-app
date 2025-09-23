import React from 'react';

const JackpotPage = () => {
  const currentJackpot = '$1,000,000'; // This would ideally come from an API
  const lastWinner = 'John Doe - $500,000'; // This would ideally come from an API

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-6">Current Jackpot</h1>
      <p className="text-5xl text-green-600 font-extrabold mb-8">{currentJackpot}</p>

      <section className="mb-10">
        <h2 className="text-3xl font-semibold mb-4">How to Win</h2>
        <p className="text-lg leading-relaxed">
          To win the jackpot, you need to match all the winning numbers drawn in our official lottery.
          Tickets can be purchased from the Tickets section of our application.
          Each ticket gives you a chance to become our next millionaire!
        </p>
      </section>

      <section>
        <h2 className="text-3xl font-semibold mb-4">Recent Winner</h2>
        <p className="text-xl font-medium">Congratulations to {lastWinner}!</p>
        <p className="text-md text-gray-600">Could you be next?</p>
      </section>
    </div>
  );
};

export default JackpotPage;
