import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { trpc } from '@/lib/trpc';

import { profileSchema, type ProfileFormValues } from '../shared/form-validation';

export function useProfileForm() {
  const utils = trpc.useUtils();

  const { data, isLoading: isLoadingProfile } = trpc.users.me.useQuery();
  const profile = data?.profile ?? null;

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      gender: undefined,
      phone: '',
      bio: '',
      country: '',
      avatar_url: '',
    },
  });

  useEffect(() => {
    if (!profile) return;
    form.reset({
      first_name: profile.first_name ?? '',
      last_name: profile.last_name ?? '',
      gender: (profile.gender as ProfileFormValues['gender']) ?? undefined,
      phone: profile.phone ?? '',
      bio: profile.bio ?? '',
      country: profile.country ?? '',
      avatar_url: profile.avatar_url ?? '',
    });
  }, [profile, form]);

  const updateMe = trpc.users.updateMe.useMutation({
    onSuccess: ({ profile: updated }) => {
      toast.success('Profile updated successfully');
      utils.users.me.setData(undefined, (prev) =>
        prev ? { ...prev, profile: updated } : prev,
      );
    },
    onError: (err) => toast.error(err.message),
  });

  const onSubmit = form.handleSubmit((values) => {
    updateMe.mutate({
      first_name: values.first_name || undefined,
      last_name: values.last_name || undefined,
      gender: values.gender,
      phone: values.phone,
      bio: values.bio,
      country: values.country || undefined,
      avatar_url: values.avatar_url,
    });
  });

  return { form, profile, isLoadingProfile, isSubmitting: updateMe.isPending, onSubmit };
}
