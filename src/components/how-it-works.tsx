export function HowItWorks() {
  const steps = [
    {
      number: '1',
      title: 'Create Your Profile',
      description: 'Share your artistic practice and what makes your space special.',
    },
    {
      number: '2',
      title: 'Search & Connect',
      description: 'Find inspiring homes and connect with like-minded artists.',
    },
    {
      number: '3',
      title: 'Book & Create',
      description: 'Secure your stay and immerse yourself in a new creative environment.',
    },
  ];

  return (
    <div className="bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Join our community of artists and start your creative journey in just three simple steps.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <div key={step.number} className="text-center">
              <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                {step.number}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {step.title}
              </h3>
              <p className="text-gray-600">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}