// @flow
import {createContext} from 'react';
// $FlowFixMe: do not complain about hooks
import type { FormikProps } from 'formik';
export const FormContext = createContext<FormikProps>({});
