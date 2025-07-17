import * as React from "react";
import style from "./PersonasList.module.scss";
import { observer } from "mobx-react-lite";
import { personasManager } from "src/store/PersonasManager.ts";
import { openPersonaModal } from "src/components/PersonaModal";
import CharacterAvatar from "src/components/CharacterAvatar/CharacterAvatar.tsx";
import Button from "src/components/Button/Button.tsx";
import { Copy, Trash } from "lucide-react";
import Tooltip from "src/components/Tooltip";

type Props = Record<string, never>;

const PersonasList: React.FC<Props> = () => {
  const { personas, personasDict } = personasManager;

  return (
    <div className={style.list}>
      {personas.map((personaId) => {
        const persona = personasDict[personaId];
        return (
          <div key={persona.id} className={style.card}>
            <button className={style.item} onClick={() => openPersonaModal({ persona })}>
              <CharacterAvatar name={persona.name} />
              <span className={style.name}>{persona.name}</span>
            </button>

            <div className={style.actions}>
              <Button
                size="small"
                onClickCapture={() => openPersonaModal({ persona: persona.clone() }).result.then(character => {
                  personasManager.add(character);
                })}
                iconBefore={Copy}
              />
              <Tooltip
                content={() => (
                  <div className={style.tooltip}>
                    <div>Delete persona?</div>
                    <Button size="small" onClickCapture={() => personasManager.remove(persona)}>
                      Delete
                    </Button>
                  </div>
                )}
              >
                {({ getReferenceProps, elementRef }) => (
                  <Button
                    ref={elementRef}
                    type="button"
                    iconBefore={Trash}
                    {...getReferenceProps({
                      onClick: (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      },
                    })}
                  />
                )}
              </Tooltip>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default observer(PersonasList) as typeof PersonasList;
