/**
 * @file index.ts
 * @module index
 * @description React Native app entry point.
 * Registers the root App component with the React Native AppRegistry.
 */

import 'react-native-url-polyfill/auto';
import { AppRegistry } from 'react-native';
import App from './App';

AppRegistry.registerComponent('ZenFit', () => App);
