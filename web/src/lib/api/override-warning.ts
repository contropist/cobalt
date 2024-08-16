import { get } from "svelte/store";

import env from "$lib/env";
import { t } from "$lib/i18n/translations";
import settings, { updateSetting } from "$lib/state/settings";

import { createDialog } from "$lib/dialogs";

export const apiOverrideWarning = async () => {
    if (env.DEFAULT_API && !get(settings).processing.seenOverrideWarning) {
        let _actions: {
            resolve: () => void;
            reject: () => void;
        };

        const promise = new Promise<void>(
            (resolve, reject) => (_actions = { resolve, reject })
        ).catch(() => {
            return {}
        });

        createDialog({
            id: "security-api-override",
            type: "small",
            icon: "warn-red",
            title: get(t)("dialog.api.override.title"),
            bodyText: get(t)("dialog.api.override.body", { value: env.DEFAULT_API }),
            dismissable: false,
            buttons: [
                {
                    text: get(t)("button.cancel"),
                    main: false,
                    action: () => {
                        _actions.reject();
                        updateSetting({
                            processing: {
                                seenOverrideWarning: true,
                            },
                        })
                    },
                },
                {
                    text: get(t)("button.continue"),
                    color: "red",
                    main: true,
                    timeout: 5000,
                    action: () => {
                        _actions.resolve();
                        updateSetting({
                            processing: {
                                allowDefaultOverride: true,
                                seenOverrideWarning: true,
                            },
                        })
                    },
                },
            ],
        })

        await promise;
    }
}
