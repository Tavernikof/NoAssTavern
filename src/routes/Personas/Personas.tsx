import * as React from "react";
import style from "./Personas.module.scss";
import Title from "src/components/Title/Title.tsx";
import ImportButton from "src/components/ImportButton/ImportButton.tsx";
import { personasManager } from "src/store/PersonasManager.ts";
import PersonasList from "src/routes/Personas/components/PersonasList";
import Button from "src/components/Button/Button.tsx";
import { UserPlus } from "lucide-react";
import { openPersonaModal } from "src/components/PersonaModal";
import { Persona } from "src/store/Persona.ts";

type Props = Record<string, never>;

const Personas: React.FC<Props> = () => {
  return (
    <>
      <Title>Personas</Title>
      <div className={style.actions}>
        <ImportButton onUpload={personasManager.importList} text="Import from tavern" />
        <Button
          iconBefore={UserPlus}
          onClick={() => {
            openPersonaModal({ persona: Persona.createEmpty() }).result.then(persona => {
              personasManager.add(persona);
            });
          }}>
          Create
        </Button>
      </div>
      <PersonasList />
    </>
  );
};

export default React.memo(Personas) as typeof Personas;
