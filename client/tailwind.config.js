/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      colors: {
        lightPurple: '#b578ff',
        darkPurple: '#6674cc',
        purplePain: '#9615db',
        appYellow: '#f5c32c',
        appOrange: '#fca61f',
        ink: '#242d49',
        muted: 'rgba(36, 45, 73, 0.65)',
        hrColor: '#cfcdcd',
        cardColor: 'rgba(255, 255, 255, 0.64)',
        inputColor: 'rgba(40, 52, 62, 0.07)',
        photo: '#4CB256',
        video: '#4A4EB7',
        location: '#EF5757',
        schedule: '#E1AE4A',
      },
      boxShadow: {
        profile: '0px 4px 17px 2px rgba(0, 0, 0, 0.25)',
        dropdown: '0 10px 24px rgba(15, 23, 42, 0.14)',
        soft: '0 4px 14px rgba(15, 23, 42, 0.12)',
      },
      backgroundImage: {
        'button-gradient': 'linear-gradient(98.63deg, #6674cc 10%, #9615db 100%)',
        'search-gradient': 'linear-gradient(98.63deg, #6674cc 0%, #b578ff 100%)',
      },
    },
  },
  plugins: [],
};
