import { queryField, nonNull, stringArg } from 'nexus';
import { AuthenticationError } from 'apollo-server-errors';

import twilio = require('twilio');
const env = process.env;

export const getUserByMobile = queryField('getUserByMobile', {
  type: 'User',
  args: {
    mobile: nonNull(stringArg()),
    otp: stringArg()
  },
  resolve: async (_parent, args, ctx) => {
    let twilioResponse;
    const user = await ctx.prisma.user.findUnique({
      where: {
        mobile: args.mobile
      }
    });

    if (user) {
      const twilioClient = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);
      if (!args.otp) {
        await twilioClient.verify
          .services(env.TWILIO_VERIFY_SID)
          .verifications.create({ to: `+${args.mobile}`, channel: 'sms' })
          .then((verification) => (twilioResponse = verification));
        if (twilioResponse.serviceSid && twilioResponse.status === 'pending') {
          return user;
        } else {
          throw new AuthenticationError(`Verification failed !`);
        }
      } else {
        await twilioClient.verify
          .services(env.TWILIO_VERIFY_SID)
          .verificationChecks.create({ to: `+${args.mobile}`, code: `${args.otp}` })
          .then((verification_check) => (twilioResponse = verification_check));
        if (twilioResponse.status === 'approved') {
          return user;
        } else {
          throw new AuthenticationError(`Verification failed !`);
        }
      }
    } else {
      throw new AuthenticationError(`No user found for that mobile: ${args.mobile}`);
    }
  }
});
