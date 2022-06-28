#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use cocoa::appkit::{NSWindow, NSWindowStyleMask, NSWindowTitleVisibility};
use mysql::prelude::Queryable;
use serde::{Deserialize, Serialize};
use serde_json::Map;
use std::{mem, path::Path, sync::Mutex};
use tauri::{CustomMenuItem, Manager, Menu, MenuEntry, MenuItem, Runtime, Submenu, Window};
use ts_rs::TS;

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

#[derive(Serialize, Deserialize, TS)]
#[ts(export)]
struct InvokeGetConnectionsReturn {
  connections: Vec<AppConnection>,
}

#[tauri::command]
fn get_connections(_state: tauri::State<TauriState>) -> InvokeGetConnectionsReturn {
  let state = load_app_state_from_file();

  InvokeGetConnectionsReturn {
    connections: state.connections,
  }
}

#[derive(Serialize, Deserialize, TS)]
#[ts(export)]
struct QueryColumn {
  name: String,
  index: i64,
}

#[derive(Serialize, Deserialize, TS)]
#[ts(export)]
struct InvokeExecuteQueryReturn {
  columns: Vec<QueryColumn>,
  #[ts(type = "Record<string, unknown>[]")]
  rows: Vec<Map<String, serde_json::Value>>,
}

fn create_db_conn(connection: &AppConnectionInformation) -> mysql::PooledConn {
  let url = format!(
    "mysql://{}:{}@{}:{}/{}",
    connection.user, connection.password, connection.host, connection.port, connection.database,
  );

  let opts = mysql::Opts::from_url(&url).unwrap();

  let pool = mysql::Pool::new(opts).unwrap();

  let connection = pool.get_conn().unwrap();

  connection
}

fn connect_to_db_if_missing(state: &tauri::State<TauriState>, connection_id: &String) {
  let curr_connection = state
    .connections
    .iter()
    .find(|c| c.connection.id == connection_id.clone())
    .unwrap();

  let mut conn_mutex = curr_connection.conn.lock().unwrap();

  if conn_mutex.is_none() {
    println!("Creating connection to {}", connection_id);

    let new_connection = create_db_conn(&curr_connection.connection.connection_information);

    let _new = mem::replace(&mut *conn_mutex, Some(new_connection));
  }
}

#[tauri::command]
fn execute_query(
  state: tauri::State<TauriState>,
  connection_id: String,
  query: String,
) -> Result<InvokeExecuteQueryReturn, String> {
  connect_to_db_if_missing(&state, &connection_id);

  let curr_connection = state
    .connections
    .iter()
    .find(|c| c.connection.id == connection_id)
    .unwrap();

  let mut conn_mutex = match curr_connection.conn.lock() {
    Ok(conn_mutex) => conn_mutex,
    Err(_e) => return Err("Failed to lock connection mutex".to_string()),
  };

  let conn = conn_mutex.as_mut().unwrap();

  let rows: Vec<mysql::Row> = match conn.query(query.as_str()) {
    Ok(conn_mutex) => conn_mutex,
    Err(e) => return Err(format!("{}", e)),
  };

  let mut result = Vec::new();
  let mut columns = Vec::new();

  for row in rows {
    let mut row_vec = Map::new();

    // If first row
    if columns.is_empty() {
      for (i, col) in row.columns().iter().enumerate() {
        columns.push(QueryColumn {
          name: col.name_str().to_string(),
          index: i as i64,
        });
      }
    }

    for (i, column) in row.columns().iter().enumerate() {
      let col_name = String::from(column.name_str());

      let value: mysql::Value = row.get(i).unwrap_or(mysql::Value::NULL);
      let value_as_string = match value {
        mysql::Value::NULL => serde_json::Value::Null,
        mysql::Value::Bytes(bytes) => serde_json::Value::String(String::from_utf8(bytes).unwrap()),
        mysql::Value::Int(value) => serde_json::Value::Number(serde_json::Number::from(value)),
        mysql::Value::Double(value) => {
          serde_json::Value::Number(serde_json::Number::from_f64(value).unwrap())
        }
        mysql::Value::Float(value) => {
          serde_json::Value::Number(serde_json::Number::from_f64(value as f64).unwrap())
        }
        _ => serde_json::Value::String(value.as_sql(false)),
      };
      println!("{}", value_as_string);
      row_vec.insert(col_name, serde_json::json!(&value_as_string));
    }
    result.push(row_vec);
  }

  Ok(InvokeExecuteQueryReturn {
    columns: columns,
    rows: result,
  })
}

#[derive(Debug, Serialize, Deserialize, Copy, Clone, TS)]
#[ts(export)]
enum ConnectionEnvironment {
  Local,
  Dev,
  Staging,
  Production,
}

#[derive(Debug, Serialize, Deserialize, Clone, TS)]
#[ts(export)]
struct AppConnectionInformation {
  user: String,
  password: String,
  database: String,
  host: String,
  port: i32,
}

#[derive(Debug, Serialize, Deserialize, Clone, TS)]
#[ts(export)]
struct AppConnectionInformationUpdate {
  user: Option<String>,
  password: Option<String>,
  database: Option<String>,
  host: Option<String>,
  port: Option<i32>,
}

#[derive(Debug, Serialize, Deserialize, Clone, TS)]
#[ts(export)]
struct AppConnection {
  id: String,
  name: String,
  environment: ConnectionEnvironment,
  connection_information: AppConnectionInformation,
}

#[derive(Debug, Serialize, Deserialize, Clone, TS)]
#[ts(export)]
struct InvokeUpdateConnection {
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
fn update_connection(update: InvokeUpdateConnection) -> bool {
  let state = load_app_state_from_file();

  let index = get_connection_index(&update.id);

  if index == -1 {
    return false;
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

  true
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

#[derive(Serialize, Deserialize, TS)]
#[ts(export)]
struct InvokeGetConnectionReturn {
  connection: Option<AppConnection>,
}

#[tauri::command]
fn get_connection(connection_id: String) -> InvokeGetConnectionReturn {
  let index = get_connection_index(&connection_id);

  if index == -1 {
    return InvokeGetConnectionReturn { connection: None };
  }

  let state = load_app_state_from_file();

  let connection = state.connections[index as usize].clone();

  InvokeGetConnectionReturn {
    connection: Some(connection),
  }
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

#[derive(Debug)]
struct Connection {
  connection: AppConnection,
  conn: Mutex<Option<mysql::PooledConn>>,
}

#[derive(Debug)]
struct TauriState {
  connections: Vec<Connection>,
}

fn main() {
  let app_state = load_app_state_from_file();

  let my_state: TauriState = TauriState {
    connections: app_state
      .connections
      .iter()
      .map(|connection| Connection {
        connection: connection.clone(),
        conn: Mutex::new(None),
      })
      .collect(),
  };

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
    .manage(my_state)
    .invoke_handler(tauri::generate_handler![
      get_connections,
      update_connection,
      add_connection,
      remove_connection,
      get_connection,
      execute_query,
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
