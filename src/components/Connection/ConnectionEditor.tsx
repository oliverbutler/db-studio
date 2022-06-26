import { Component, createMemo } from 'solid-js';
import { createMutable, createStore } from 'solid-js/store';
import { Environment } from '../../data/state';
import Button, { ButtonColour } from '../Button';
import { Input } from '../Input';
import { Select } from '../Select';
import { ConnectionInformation } from '../../data/state';
import { api } from '../../api';
import { deepClone } from '../../utils';

interface ConnectionEditorProps {
  connectionInformation: ConnectionInformation;
  close: () => void;
}

const isValidEnvironment = (env: string): env is Environment =>
  Object.values(Environment).includes(env as Environment);

export const ConnectionEditor: Component<ConnectionEditorProps> = (props) => {
  const [fields, setFields] = createStore(
    deepClone(props.connectionInformation)
  );

  const handleSubmit = () => {
    api.updateConnection(fields, () => props?.close());
  };

  return (
    <form class="w-72 px-2 pb-2" onsubmit={(e) => e.preventDefault()}>
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
        autocapitalize="off"
      />
      <Input
        label="Database"
        value={fields.database}
        onChange={(e) => setFields('database', e.currentTarget.value)}
        autocapitalize="off"
      />
      <Input
        label="Host"
        value={fields.host}
        onChange={(e) => setFields('host', e.currentTarget.value)}
        autocapitalize="off"
      />
      <Input
        label="Port"
        value={fields.port}
        onChange={(e) => setFields('port', Number(e.currentTarget.value) ?? 0)}
        type="number"
      />
      <Input
        label="Password"
        type="password"
        value={fields.password ?? ''}
        onChange={(e) => setFields('password', e.currentTarget.value)}
        placeholder="********"
        autocapitalize="off"
      />
      <Button
        onClick={handleSubmit}
        class="mt-4"
        variation="primary"
        colour={ButtonColour.Secondary}
        type="submit"
      >
        Save
      </Button>
    </form>
  );
};
