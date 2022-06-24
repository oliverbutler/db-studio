#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use cocoa::appkit::{NSWindow, NSWindowStyleMask, NSWindowTitleVisibility};
use serde::{Deserialize, Serialize};
use std::path::Path;
use tauri::Manager;
use tauri::MenuEntry;
use tauri::Runtime;
use tauri::Window;
use tauri::{CustomMenuItem, Menu, MenuItem, Submenu};

use window_vibrancy::{apply_vibrancy, NSVisualEffectMaterial};

pub trait WindowExt {
  #[cfg(target_os = "macos")]
  fn set_transparent_titlebar(&self, title_transparent: bool, remove_toolbar: bool);
}

impl<R: Runtime> WindowExt for Window<R> {
  #[cfg(target_os = "macos")]
  fn set_transparent_titlebar(&self, title_transparent: bool, remove_tool_bar: bool) {
    unsafe {
      let id = self.ns_window().unwrap() as cocoa::base::id;
      NSWindow::setTitlebarAppearsTransparent_(id, cocoa::base::YES);
      let mut style_mask = id.styleMask();
      style_mask.set(
        NSWindowStyleMask::NSFullSizeContentViewWindowMask,
        title_transparent,
      );

      if remove_tool_bar {
        style_mask.remove(
          NSWindowStyleMask::NSClosableWindowMask
            | NSWindowStyleMask::NSMiniaturizableWindowMask
            | NSWindowStyleMask::NSResizableWindowMask,
        );
      }

      id.setStyleMask_(style_mask);

      id.setTitleVisibility_(if title_transparent {
        NSWindowTitleVisibility::NSWindowTitleHidden
      } else {
        NSWindowTitleVisibility::NSWindowTitleVisible
      });

      id.setTitlebarAppearsTransparent_(if title_transparent {
        cocoa::base::YES
      } else {
        cocoa::base::NO
      });
    }
  }
}

#[tauri::command]
fn get_connections() -> Vec<AppConnection> {
  let state = load_app_state_from_file();

  state.connections
}

#[derive(Debug, Serialize, Deserialize, Copy, Clone)]
enum ConnectionEnvironment {
  Local,
  Dev,
  Staging,
  Production,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
struct AppConnectionInformation {
  user: String,
  password: String,
  database: String,
  host: String,
  port: i64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
struct AppConnectionInformationUpdate {
  user: Option<String>,
  password: Option<String>,
  database: Option<String>,
  host: Option<String>,
  port: Option<i64>,
  environment: Option<ConnectionEnvironment>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
struct AppConnection {
  id: String,
  name: String,
  environment: ConnectionEnvironment,
  connection_information: AppConnectionInformation,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
struct AppConnectionUpdate {
  id: String,
  name: Option<String>,
  environment: Option<ConnectionEnvironment>,
  connection_information: Option<AppConnectionInformationUpdate>,
}

#[derive(Debug, Serialize, Deserialize)]
struct AppState {
  connections: Vec<AppConnection>,
}

fn save_app_state_to_file(state: &AppState) {
  let path = Path::new("app_state.json");
  let mut file = std::fs::File::create(path).unwrap();
  serde_json::to_writer_pretty(&mut file, state).unwrap();
}

fn load_app_state_from_file() -> AppState {
  create_app_state_if_missing();
  let path = Path::new("app_state.json");
  let mut file = std::fs::File::open(path).unwrap();
  let state: AppState = serde_json::from_reader(&mut file).unwrap();
  state
}

fn create_app_state_if_missing() {
  let path = Path::new("app_state.json");
  if !path.exists() {
    let state = AppState {
      connections: vec![],
    };
    save_app_state_to_file(&state);
  }
}

#[tauri::command]
fn add_connection(connection: AppConnection) {
  let mut state = load_app_state_from_file();

  state.connections.push(connection);
  save_app_state_to_file(&state);
}

#[tauri::command]
fn update_connection(update: AppConnectionUpdate) {
  println!("update_connection: {:?}", update);

  let state = load_app_state_from_file();

  let index = get_connection_index(&update.id);

  if index == -1 {
    return;
  }

  let new_connections = state
    .connections
    .iter()
    .map(|connection| {
      if connection.id == update.id {
        let new_con = update.clone();

        AppConnection {
          id: new_con.id,
          name: new_con.name.unwrap_or(connection.name.to_string()),
          environment: new_con.environment.unwrap_or(connection.environment),
          connection_information: match new_con.connection_information {
            Some(connection_info) => AppConnectionInformation {
              user: connection_info
                .user
                .unwrap_or(connection.connection_information.user.to_string()),
              password: connection_info
                .password
                .unwrap_or(connection.connection_information.password.to_string()),
              database: connection_info
                .database
                .unwrap_or(connection.connection_information.database.to_string()),
              host: connection_info
                .host
                .unwrap_or(connection.connection_information.host.to_string()),
              port: connection_info
                .port
                .unwrap_or(connection.connection_information.port),
            },
            None => connection.connection_information.clone(),
          },
        }
      } else {
        connection.clone()
      }
    })
    .collect::<Vec<_>>();

  let new_state = AppState {
    connections: new_connections,
  };

  save_app_state_to_file(&new_state);
}

// -1 means no connection
fn get_connection_index(connection_id: &String) -> i64 {
  let state = load_app_state_from_file();

  return state
    .connections
    .iter()
    .position(|c| c.id == *connection_id)
    .unwrap() as i64;
}

#[tauri::command]
fn remove_connection(connection_id: String) {
  let mut state = load_app_state_from_file();

  let index = get_connection_index(&connection_id);

  if index != -1 {
    state.connections.remove(index as usize);
  }

  save_app_state_to_file(&state);
}

fn main() {
  let context = tauri::generate_context!();
  tauri::Builder::default()
    .menu(Menu::with_items([MenuEntry::Submenu(Submenu::new(
      "File",
      Menu::with_items([
        MenuItem::Quit.into(),
        MenuItem::CloseWindow.into(),
        CustomMenuItem::new("hello", "Hello").into(),
      ]),
    ))]))
    .invoke_handler(tauri::generate_handler![
      get_connections,
      update_connection,
      add_connection,
      remove_connection
    ])
    .setup(|app| {
      let win = app.get_window("main").unwrap();
      win.set_transparent_titlebar(true, false);

      #[cfg(debug_assertions)] // only include this code on debug builds
      {
        let window = app.get_window("main").unwrap();
        window.open_devtools();
        window.close_devtools();
      }

      #[cfg(target_os = "macos")]
      apply_vibrancy(&win, NSVisualEffectMaterial::HudWindow)
        .expect("Unsupported platform! 'apply_vibrancy' is only supported on macOS");

      #[cfg(target_os = "windows")]
      apply_blur(&window, Some((18, 18, 18, 125)))
        .expect("Unsupported platform! 'apply_blur' is only supported on Windows");

      Ok(())
    })
    .run(context)
    .expect("error while running tauri application");
}
