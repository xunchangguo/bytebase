import { computed, defineComponent, watch } from "vue";
import { useRouter } from "vue-router";
import { WORKSPACE_ROUTE_MY_ISSUES } from "./router/dashboard/workspaceRoutes";
import { SQL_EDITOR_HOME_MODULE } from "./router/sqlEditor";
import { useRecentVisit } from "./router/useRecentVisit";
import { useActuatorV1Store } from "./store";
import { isDev } from "./utils";

export default defineComponent({
  name: "DummyRootView",
  setup() {
    const { lastVisit } = useRecentVisit();
    const router = useRouter();
    const actuatorStore = useActuatorV1Store();
    const mode = computed(() => {
      return actuatorStore.appProfile.mode;
    });
    watch(
      mode,
      () => {
        const fallback = () => {
          router.replace({
            name: WORKSPACE_ROUTE_MY_ISSUES,
          });
        };
        // Redirect to
        // - /sql-editor if mode == 'EDITOR'
        // - lastVisit.path if not empty
        // - /issues as fallback
        // Only turned on when isDev() is true
        if (!isDev()) {
          return fallback();
        }

        if (actuatorStore.appProfile.mode === "EDITOR") {
          router.replace({
            name: SQL_EDITOR_HOME_MODULE,
          });
          return;
        }

        if (!lastVisit.value) {
          return fallback();
        }
        const { path } = lastVisit.value;
        // Ignore all possible root path records
        if (
          path === "" ||
          path === "/" ||
          path.startsWith("?") ||
          path.startsWith("#") ||
          path.startsWith("/?") ||
          path.startsWith("/#") ||
          path.startsWith("/403") ||
          path.startsWith("/404")
        ) {
          return fallback();
        }
        router.replace({
          path,
        });
      },
      {
        immediate: true,
      }
    );
  },
  render() {
    return null;
  },
});