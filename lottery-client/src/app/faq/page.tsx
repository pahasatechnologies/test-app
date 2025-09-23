import React from 'react';

const FAQPage = () => {
  const faqs = [
    {
      question: 'How do I buy a lottery ticket?',
      answer: 'You can purchase lottery tickets directly from the \'Tickets\' section of our application. Simply choose your numbers or opt for a quick pick, and complete the secure transaction.',
    },
    {
      question: 'What are the rules for winning the jackpot?',
      answer: 'To win the grand jackpot, you must match all the main numbers drawn. Smaller prizes are awarded for matching a subset of the numbers. Detailed rules are available in the \'About\' section.',
    },
    {
      question: 'How will I receive my winnings?',
      answer: 'Winnings are automatically credited to your in-app wallet. You can then choose to withdraw your funds via various secure methods available in the \'Wallet\' section.',
    },
    {
      question: 'Is there a minimum age to play?',
      answer: 'Yes, you must be at least 18 years old to participate in our lottery. Age verification may be required upon registration or withdrawal.',
    },
    {
      question: 'How often are draws held?',
      answer: 'Draws are held daily at 8:00 PM UTC. Results are usually available within minutes after the draw. Check the \'Draws\' section for more details and past results.',
    },
  ];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-6 text-center">Frequently Asked Questions</h1>
      <div className="space-y-6">
        {faqs.map((faq, index) => (
          <div key={index} className="border p-4 rounded-lg shadow-md bg-white">
            <h2 className="text-xl font-semibold mb-2 text-blue-700">{faq.question}</h2>
            <p className="text-gray-800 leading-relaxed">{faq.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQPage;
