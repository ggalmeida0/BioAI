#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { BioStack } from '../lib/bio-stack';

const app = new cdk.App();
new BioStack(app, 'BioStack');
