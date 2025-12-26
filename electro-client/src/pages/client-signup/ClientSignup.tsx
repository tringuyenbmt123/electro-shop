import React, { useEffect, useState } from 'react';
import { z } from 'zod';
import MessageUtils from 'utils/MessageUtils';
import { useForm, zodResolver } from '@mantine/form';
import { Empty, RegistrationRequest, RegistrationResponse, SelectOption } from 'types';
import useTitle from 'hooks/use-title';
import useSelectAddress from 'hooks/use-select-address';
import useGetAllApi from 'hooks/use-get-all-api';
import { ProvinceResponse } from 'models/Province';
import ProvinceConfigs from 'pages/province/ProvinceConfigs';
import { DistrictResponse } from 'models/District';
import DistrictConfigs from 'pages/district/DistrictConfigs';
import { WardResponse } from 'models/Ward';
import WardConfigs from 'pages/ward/WardConfigs';
import { useMutation } from 'react-query';
import { UserRequest } from 'models/User';
import FetchUtils, { ErrorMessage } from 'utils/FetchUtils';
import ResourceURL from 'constants/ResourceURL';
import NotifyUtils from 'utils/NotifyUtils';
import {
  Button,
  Card,
  Container,
  Divider,
  Group,
  PasswordInput,
  Select,
  Stack,
  Stepper,
  Text,
  TextInput,
  Title,
  useMantineTheme
} from '@mantine/core';
import useAuthStore from 'stores/use-auth-store';
import { Check, MailOpened, ShieldCheck, UserCheck } from 'tabler-icons-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import MiscUtils from 'utils/MiscUtils';
import { useModals } from '@mantine/modals';
import RecaptchaWidget from 'components/RecaptchaWidget/RecaptchaWidget';

const genderSelectList: SelectOption[] = [
  {
    value: 'M',
    label: 'Nam',
  },
  {
    value: 'F',
    label: 'N�+�',
  },
];

function ClientSignup() {
  useTitle();

  const { user, currentSignupUserId } = useAuthStore();

  const [searchParams] = useSearchParams();

  const userId = searchParams.get('userId') || currentSignupUserId;

  const currentStep = userId ? 1 : 0; // Nߦ+u c+� userId th+� nhߦ�y sang b���+�c 2

  const [active, setActive] = useState(currentStep);

  const nextStep = () => setActive((current) => current < 1 ? current + 1 : (current === 1 ? 3 : current));

  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [navigate, user]);

  return (
    <main>
      <Container size="xl">
        <Stack align="center" spacing={50}>
          <Title order={2}>-�-�ng k++ t+�i khoߦ�n</Title>

          <Stepper
            active={active}
            onStepClick={setActive}
            breakpoint="xs"
            styles={{ root: { width: '100%', maxWidth: 800 }, content: { paddingTop: 50 } }}
          >
            <Stepper.Step
              icon={<UserCheck size={18} />}
              label="B���+�c 1"
              description="Tߦ�o t+�i khoߦ�n"
              allowStepSelect={false}
            >
              <ClientSignupStepOne nextStep={nextStep} />
            </Stepper.Step>
            <Stepper.Step
              icon={<MailOpened size={18} />}
              label="B���+�c 2"
              description="X+�c nhߦ�n email"
              allowStepSelect={false}
            >
              <ClientSignupStepTwo nextStep={nextStep} userId={Number(userId) || null} />
            </Stepper.Step>
            <Stepper.Step
              icon={<ShieldCheck size={18} />}
              label="B���+�c 3"
              description="-�-�ng k++ th+�nh c+�ng"
              allowStepSelect={false}
            />
            <Stepper.Completed>
              <ClientSignupStepThree />
            </Stepper.Completed>
          </Stepper>
        </Stack>
      </Container>
    </main>
  );
}

function ClientSignupStepOne({ nextStep }: { nextStep: () => void }) {
  const { updateCurrentSignupUserId } = useAuthStore();

  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [recaptchaResetSignal, setRecaptchaResetSignal] = useState(0);

  const initialFormValues = {
    username: '',
    password: '',
    fullname: '',
    email: '',
    phone: '',
    gender: 'M' as 'M' | 'F',
    'address.line': '',
    'address.provinceId': null as string | null,
    'address.districtId': null as string | null,
    'address.wardId': null as string | null,
    avatar: null, // Kh+�ng d+�ng
    status: '2', // Kh+�ng d+�ng
    roles: [] as string[], // Kh+�ng d+�ng
  };

  const formSchema = z.object({
    username: z.string({ invalid_type_error: 'Vui l+�ng kh+�ng b�+� tr�+�ng' })
      .min(2, MessageUtils.min('T+�n t+�i khoߦ�n', 2)),
    password: z.string({ invalid_type_error: 'Vui l+�ng kh+�ng b�+� tr�+�ng' })
      .min(1, MessageUtils.min('Mߦ�t khߦ�u', 1)),
    fullname: z.string({ invalid_type_error: 'Vui l+�ng kh+�ng b�+� tr�+�ng' }),
    email: z.string({ invalid_type_error: 'Vui l+�ng kh+�ng b�+� tr�+�ng' })
      .email({ message: 'Nhߦ�p email -�+�ng -��+�nh dߦ�ng' }),
    phone: z.string({ invalid_type_error: 'Vui l+�ng kh+�ng b�+� tr�+�ng' })
      .regex(/(((\+|)84)|0)(3|5|7|8|9)+([0-9]{8})\b/, { message: 'Nhߦ�p s�+� -�i�+�n thoߦ�i -�+�ng -��+�nh dߦ�ng' }),
    gender: z.string({ invalid_type_error: 'Vui l+�ng kh+�ng b�+� tr�+�ng' }),
    'address.line': z.string({ invalid_type_error: 'Vui l+�ng kh+�ng b�+� tr�+�ng' }),
    'address.provinceId': z.string({ invalid_type_error: 'Vui l+�ng kh+�ng b�+� tr�+�ng' }),
    'address.districtId': z.string({ invalid_type_error: 'Vui l+�ng kh+�ng b�+� tr�+�ng' }),
    'address.wardId': z.string({ invalid_type_error: 'Vui l+�ng kh+�ng b�+� tr�+�ng' }),
    avatar: z.string().nullable(),
    status: z.string(),
    roles: z.array(z.string()),
  });

  const form = useForm({
    initialValues: initialFormValues,
    schema: zodResolver(formSchema),
  });

  useSelectAddress(form, 'address.provinceId', 'address.districtId', 'address.wardId');

  const [provinceSelectList, setProvinceSelectList] = useState<SelectOption[]>([]);
  const [districtSelectList, setDistrictSelectList] = useState<SelectOption[]>([]);
  const [wardSelectList, setWardSelectList] = useState<SelectOption[]>([]);

  useGetAllApi<ProvinceResponse>(ProvinceConfigs.resourceUrl, ProvinceConfigs.resourceKey,
    { all: 1 },
    (provinceListResponse) => {
      const selectList: SelectOption[] = provinceListResponse.content.map((item) => ({
        value: String(item.id),
        label: item.name,
      }));
      setProvinceSelectList(selectList);
    },
    { refetchOnWindowFocus: false }
  );
  useGetAllApi<DistrictResponse>(DistrictConfigs.resourceUrl, DistrictConfigs.resourceKey,
    { all: 1, filter: `province.id==${form.values['address.provinceId'] || 0}` },
    (districtListResponse) => {
      const selectList: SelectOption[] = districtListResponse.content.map((item) => ({
        value: String(item.id),
        label: item.name,
      }));
      setDistrictSelectList(selectList);
    },
    { refetchOnWindowFocus: false }
  );
  useGetAllApi<WardResponse>(WardConfigs.resourceUrl, WardConfigs.resourceKey,
    { all: 1, filter: `district.id==${form.values['address.districtId'] || 0}` },
    (wardListResponse) => {
      const selectList: SelectOption[] = wardListResponse.content.map((item) => ({
        value: String(item.id),
        label: item.name,
      }));
      setWardSelectList(selectList);
    },
    { refetchOnWindowFocus: false }
  );

  const registerUserApi = useMutation<RegistrationResponse, ErrorMessage, UserRequest>(
    (requestBody) => FetchUtils.post(ResourceURL.CLIENT_REGISTRATION, requestBody),
    {
      onSuccess: (registrationResponse) => {
        NotifyUtils.simpleSuccess('Tߦ�o t+�i khoߦ�n th+�nh c+�ng');
        updateCurrentSignupUserId(registrationResponse.userId);
        nextStep();
        setRecaptchaResetSignal((value) => value + 1);
        setRecaptchaToken(null);
      },
      onError: () => {
        NotifyUtils.simpleFailed('Tߦ�o t+�i khoߦ�n kh+�ng th+�nh c+�ng');
        setRecaptchaResetSignal((value) => value + 1);
        setRecaptchaToken(null);
      },
    }
  );

  const handleFormSubmit = form.onSubmit((formValues) => {
    if (!recaptchaToken) {
      NotifyUtils.simpleFailed('Vui long xac minh reCAPTCHA');
      return;
    }
    const requestBody: UserRequest = {
      username: formValues.username,
      password: formValues.password,
      fullname: formValues.fullname,
      email: formValues.email,
      phone: formValues.phone,
      gender: formValues.gender,
      address: {
        line: formValues['address.line'],
        provinceId: Number(formValues['address.provinceId']),
        districtId: Number(formValues['address.districtId']),
        wardId: Number(formValues['address.wardId']),
      },
      avatar: formValues.avatar,
      status: Number(formValues.status),
      roles: [],
      recaptchaToken: recaptchaToken,
    };

    registerUserApi.mutate(requestBody);
  });

  return (
    <Card withBorder shadow="md" p={30} radius="md" sx={{ maxWidth: 500, margin: 'auto' }}>
      <form onSubmit={handleFormSubmit}>
        <Stack>
          <TextInput
            required
            radius="md"
            label="T+�n t+�i khoߦ�n"
            placeholder="Nhߦ�p t+�n t+�i khoߦ�n mong mu�+�n"
            {...form.getInputProps('username')}
          />
          <PasswordInput
            required
            radius="md"
            label="Mߦ�t khߦ�u"
            placeholder="Nhߦ�p mߦ�t khߦ�u mong mu�+�n"
            {...form.getInputProps('password')}
          />
          <TextInput
            required
            radius="md"
            label="H�+� v+� t+�n"
            placeholder="Nhߦ�p h�+� v+� t+�n c�+�a bߦ�n"
            {...form.getInputProps('fullname')}
          />
          <TextInput
            required
            radius="md"
            label="Email"
            placeholder="Nhߦ�p email c�+�a bߦ�n"
            {...form.getInputProps('email')}
          />
          <TextInput
            required
            radius="md"
            label="S�+� -�i�+�n thoߦ�i"
            placeholder="Nhߦ�p s�+� -�i�+�n thoߦ�i c�+�a bߦ�n"
            {...form.getInputProps('phone')}
          />
          <Select
            required
            radius="md"
            label="Gi�+�i t+�nh"
            placeholder="Ch�+�n gi�+�i t+�nh"
            data={genderSelectList}
            {...form.getInputProps('gender')}
          />
          <Select
            required
            radius="md"
            label="T�+�nh th+�nh"
            placeholder="Ch�+�n t�+�nh th+�nh"
            data={provinceSelectList}
            {...form.getInputProps('address.provinceId')}
          />
          <Select
            required
            radius="md"
            label="Quߦ�n huy�+�n"
            placeholder="Ch�+�n quߦ�n huy�+�n"
            data={districtSelectList}
            disabled={form.values['address.provinceId'] === null}
            {...form.getInputProps('address.districtId')}
          />
          <Select
            required
            radius="md"
            label="Ph���+�ng x+�"
            placeholder="Ch�+�n ph���+�ng x+�"
            data={wardSelectList}
            disabled={form.values['address.districtId'] === null}
            {...form.getInputProps('address.wardId')}
          />
          <TextInput
            required
            radius="md"
            label="-��+�a ch�+�"
            placeholder="Nhߦ�p -��+�a ch�+� c�+�a bߦ�n"
            {...form.getInputProps('address.line')}
          />
          <RecaptchaWidget onChange={setRecaptchaToken} resetSignal={recaptchaResetSignal} />
          <Button
            radius="md"
            type="submit"
            disabled={MiscUtils.isEquals(initialFormValues, form.values) || registerUserApi.isLoading || !recaptchaToken}
          >
            -�-�ng k++
          </Button>
        </Stack>
      </form>
    </Card>
  );
}

function ClientSignupStepTwo({ nextStep, userId }: { nextStep: () => void, userId: number | null }) {
  const theme = useMantineTheme();
  const modals = useModals();

  const { updateCurrentSignupUserId } = useAuthStore();

  const initialFormValues = {
    token: '',
  };

  const formSchema = z.object({
    token: z.string({ invalid_type_error: 'Vui l+�ng kh+�ng b�+� tr�+�ng' }),
  });

  const form = useForm({
    initialValues: initialFormValues,
    schema: zodResolver(formSchema),
  });

  const confirmRegistrationApi = useMutation<void, ErrorMessage, RegistrationRequest>(
    (requestBody) => FetchUtils.post(ResourceURL.CLIENT_REGISTRATION_CONFIRM, requestBody),
    {
      onSuccess: () => {
        NotifyUtils.simpleSuccess('X+�c nhߦ�n t+�i khoߦ�n th+�nh c+�ng');
        updateCurrentSignupUserId(null);
        nextStep();
      },
      onError: () => NotifyUtils.simpleFailed('X+�c nhߦ�n t+�i khoߦ�n kh+�ng th+�nh c+�ng'),
    }
  );

  const resendRegistrationTokenApi = useMutation<Empty, ErrorMessage, { userId: number }>(
    (request) => FetchUtils.get(ResourceURL.CLIENT_REGISTRATION_RESEND_TOKEN(request.userId)),
    {
      onSuccess: () => {
        NotifyUtils.simpleSuccess('-�+� g�+�i lߦ�i m+� x+�c nhߦ�n th+�nh c+�ng');
        modals.closeAll();
      },
      onError: () => NotifyUtils.simpleFailed('G�+�i lߦ�i m+� x+�c nhߦ�n kh+�ng th+�nh c+�ng'),
    }
  );

  const handleFormSubmit = form.onSubmit((formValues) => {
    if (userId) {
      const requestBody: RegistrationRequest = {
        userId: userId,
        token: formValues.token,
      };

      confirmRegistrationApi.mutate(requestBody);
    }
  });

  const handleResendTokenButton = () => {
    if (userId) {
      modals.openConfirmModal({
        size: 'xs',
        overlayColor: theme.colorScheme === 'dark' ? theme.colors.dark[9] : theme.colors.gray[2],
        overlayOpacity: 0.55,
        overlayBlur: 3,
        closeOnClickOutside: false,
        closeOnConfirm: false,
        title: <strong>G�+�i lߦ�i m+� x+�c nhߦ�n</strong>,
        children: <Text size="sm">Bߦ�n c+� mu�+�n g�+�i lߦ�i m+� x+�c nhߦ�n -�ߦ+n email -�+� nhߦ�p tr���+�c -�+�?</Text>,
        labels: {
          cancel: '-�+�ng',
          confirm: 'G�+�i',
        },
        confirmProps: { color: 'blue', disabled: resendRegistrationTokenApi.isLoading },
        onConfirm: () => resendRegistrationTokenApi.mutate({ userId: userId }),
      });
    }
  };

  const handleResendTokenWithNewEmailButton = () => {
    modals.openModal({
      size: 'md',
      overlayColor: theme.colorScheme === 'dark' ? theme.colors.dark[9] : theme.colors.gray[2],
      overlayOpacity: 0.55,
      overlayBlur: 3,
      closeOnClickOutside: false,
      title: <strong>Thay -��+�i email</strong>,
      children: <ChangeEmailModal userId={userId} />,
    });
  };

  return (
    <Card withBorder shadow="md" p={30} radius="md" sx={{ width: 500, margin: 'auto' }}>
      <Stack>
        <form onSubmit={handleFormSubmit}>
          <Stack>
            <TextInput
              required
              radius="md"
              label="M+� x+�c nhߦ�n"
              placeholder="Nhߦ�p m+� x+�c nhߦ�n -�+� g�+�i"
              {...form.getInputProps('token')}
            />
            <Button
              radius="md"
              type="submit"
              disabled={MiscUtils.isEquals(initialFormValues, form.values) || confirmRegistrationApi.isLoading}
            >
              X+�c nhߦ�n
            </Button>
          </Stack>
        </form>

        <Divider label="hoߦ+c" labelPosition="center" />

        <Button radius="md" variant="outline" onClick={handleResendTokenButton}>
          G�+�i m+� x+�c nhߦ�n lߦ�n n�+�a
        </Button>

        <Button radius="md" variant="outline" onClick={handleResendTokenWithNewEmailButton}>
          G�+�i m+� x+�c nhߦ�n lߦ�n n�+�a v�+�i email m�+�i
        </Button>
      </Stack>
    </Card>
  );
}

function ClientSignupStepThree() {
  const theme = useMantineTheme();

  return (
    <Stack align="center" sx={{ alignItems: 'center', color: theme.colors.teal[6] }}>
      <Check size={100} strokeWidth={1} />
      <Text weight={500}>-�+� tߦ�o t+�i khoߦ�n v+� x+�c nhߦ�n th+�nh c+�ng!</Text>
      <Button radius="md" size="lg" mt="xl" component={Link} to="/signin">-�-�ng nhߦ�p</Button>
    </Stack>
  );
}

function ChangeEmailModal({ userId }: { userId: number | null }) {
  const modals = useModals();

  const initialFormValues = {
    email: '',
  };

  const formSchema = z.object({
    email: z.string({ invalid_type_error: 'Vui l+�ng kh+�ng b�+� tr�+�ng' })
      .email({ message: 'Nhߦ�p email -�+�ng -��+�nh dߦ�ng' }),
  });

  const form = useForm({
    initialValues: initialFormValues,
    schema: zodResolver(formSchema),
  });

  const changeRegistrationEmailApi = useMutation<Empty, ErrorMessage, { userId: number, email: string }>(
    (request) => FetchUtils.put(
      ResourceURL.CLIENT_REGISTRATION_CHANGE_EMAIL(request.userId),
      {},
      { email: request.email }
    ),
    {
      onSuccess: () => {
        NotifyUtils.simpleSuccess('-�+� -��+�i email th+�nh c+�ng v+� -�+� g�+�i lߦ�i m+� x+�c nhߦ�n m�+�i');
        modals.closeAll();
      },
      onError: () => NotifyUtils.simpleFailed('Thay -��+�i email kh+�ng th+�nh c+�ng'),
    }
  );

  const handleFormSubmit = form.onSubmit((formValues) => {
    if (userId) {
      changeRegistrationEmailApi.mutate({ userId: userId, email: formValues.email });
    }
  });

  return (
    <form onSubmit={handleFormSubmit}>
      <Stack>
        <TextInput
          data-autofocus
          required
          radius="md"
          label="Email m�+�i"
          placeholder="Nhߦ�p email m�+�i"
          {...form.getInputProps('email')}
        />
        <Group position="right">
          <Button radius="md" variant="default" onClick={modals.closeAll}>
            -�+�ng
          </Button>
          <Button
            radius="md"
            type="submit"
            disabled={MiscUtils.isEquals(initialFormValues, form.values) || changeRegistrationEmailApi.isLoading}
          >
            Thay -��+�i v+� G�+�i
          </Button>
        </Group>
      </Stack>
    </form>
  );
}

export default ClientSignup;