import { Component, createEffect, createSignal, For } from 'solid-js';
import { createStore, produce } from 'solid-js/store';
import { currentConnection } from '../../data/connections';
import { Environment } from '../../data/state';
import Button, { ButtonColour } from '../Button';
import { Input } from '../Input';
import { Select } from '../Select';
import { ConnectionInformation } from '../../data/state';
import { updateConnection } from '../../api';

interface ConnectionEditorProps {
  connectionInformation: ConnectionInformation;
}

const isValidEnvironment = (env: string): env is Environment =>
  Object.values(Environment).includes(env as Environment);

export const ConnectionEditor: Component<ConnectionEditorProps> = (props) => {
  const [fields, setFields] = createStore(props.connectionInformation);

  const handleSubmit = () => {
    updateConnection({
      id: fields.id,
      name: fields.name,
      environment: fields.environment,
      connection_information: {
        database: fields.database,
        host: fields.host,
        port: fields.port,
        user: fields.user,
        ...(fields.password ? { password: fields.password } : {}),
      },
    });
  };

  return (
    <div class="w-72 px-2 pb-2">
      <Input
        label="Name"
        value={fields.name}
        onChange={(e) => setFields('name', e.currentTarget.value)}
      />
      <Select
        label="Environment"
        value={fields.environment}
        options={[
          Environment.Dev,
          Environment.Local,
          Environment.Staging,
          Environment.Production,
        ].map((e) => ({ label: e, value: e }))}
        onChange={(e) =>
          isValidEnvironment(e.currentTarget.value) &&
          setFields('environment', e.currentTarget.value)
        }
      />
      <Input
        label="User"
        value={fields.user}
        onChange={(e) => setFields('user', e.currentTarget.value)}
      />
      <Input
        label="Database"
        value={fields.database}
        onChange={(e) => setFields('database', e.currentTarget.value)}
      />
      <Input
        label="Host"
        value={fields.host}
        onChange={(e) => setFields('host', e.currentTarget.value)}
      />
      <Input
        label="Port"
        value={fields.port}
        onChange={(e) => setFields('port', Number(e.currentTarget.value) ?? 0)}
      />
      <Input
        label="Password"
        type="password"
        value={fields.password ?? ''}
        onChange={(e) => setFields('password', e.currentTarget.value)}
        placeholder="********"
      />
      <Button
        onClick={handleSubmit}
        class="mt-4"
        variation="primary"
        colour={ButtonColour.Secondary}
      >
        Save
      </Button>
    </div>
  );
};
