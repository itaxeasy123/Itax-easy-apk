// module.exports = function (api) {
//   api.cache(true);
//   return {
//     presets: ['babel-preset-expo'],
//     plugins: [
//       [
//         'module-resolver',
//         {
//           root: ['./'],
//           alias: {
//             '@': './src',
//             '@components': './src/components',
//             '@services': './src/services',
//             '@utils': './src/utils',
//             '@features': './src/features',
//             '@store': './src/store'
//           }
//         }
//       ]
//     ]
//   };
// };

module.exports = function (api) {
  api.cache(true);

  return {
    presets: ['babel-preset-expo'],

    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './src',
            '@components': './src/components',
            '@services': './src/services',
            '@utils': './src/utils',
            '@features': './src/features',
            '@store': './src/store',
          },
        },
      ],

      // MUST BE LAST
      'react-native-reanimated/plugin',
    ],
  };
};