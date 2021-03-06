import { nonNull, stringArg, subscriptionField } from 'nexus';

import { User } from '../models';
import { withFilter } from 'apollo-server-express';

export const USER_SIGNED_IN = 'USER_SIGNED_IN';
export const USER_UPDATED = 'USER_UPDATED';

interface User {
  id: string;
  email: string;
  name: string;
  nickname: string;
  thumbURL: string;
  photoURL: string;
  birthDay: string;
  gender: string;
  phone: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}

export const UserSignedIn = subscriptionField('userSignedIn', {
  type: 'User',
  args: {
    userId: nonNull(stringArg())
  },
  subscribe: withFilter(
    (_, args, ctx) => {
      const { pubsub } = ctx;
      return pubsub.asyncIterator(USER_SIGNED_IN);
    },
    (payload, { userId }) => {
      return payload.id === userId;
    }
  ),
  resolve: (payload) => {
    return payload;
  }
});

export const UserUpdated = subscriptionField('userUpdated', {
  type: 'User',
  args: {
    userId: nonNull(stringArg())
  },
  subscribe: withFilter(
    (_, args, ctx) => {
      const { pubsub } = ctx;
      return pubsub.asyncIterator(USER_UPDATED);
    },
    (payload, { userId }) => {
      return payload.id === userId;
    }
  ),
  resolve: (payload) => {
    return payload;
  }
});
